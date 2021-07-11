import { doesNotThrow, ok, strictEqual, throws } from "assert";
import { spawnSync } from "child_process";
import { ESLintRule } from "@manuth/eslint-plugin-typescript";
import { TempDirectory, TempFile } from "@manuth/temp-files";
import { Constants } from "@manuth/typescript-eslint-plugin";
import { copy, pathExists, remove } from "fs-extra";
import npmWhich = require("npm-which");
import { Diagnostic } from "../Diagnostics/Diagnostic";
import { DiagnosticsResponseAnalyzer } from "../Diagnostics/DiagnosticsResponseAnalyzer";
import type { LanguageServiceTester } from "../LanguageServiceTester";
import { ITestContext } from "./ITestContext";
import { TestLanguageServiceTester } from "./TestLanguageServiceTester";

/**
 * Registers tests for the {@link LanguageServiceTester `LanguageServiceTester`} class.
 *
 * @param context
 * The test-context.
 */
export function LanguageServiceTesterTests(context: ITestContext): void
{
    suite(
        nameof<LanguageServiceTester>(),
        () =>
        {
            let tester: TestLanguageServiceTester;

            setup(
                () =>
                {
                    tester = new TestLanguageServiceTester();
                });

            teardown(
                async function()
                {
                    this.timeout(10 * 1000);
                    await tester.Dispose();
                });

            suite(
                nameof<LanguageServiceTester>((tester) => tester.DefaultWorkspace),
                () =>
                {
                    test(
                        "Checking whether the default workspace is located at the working directory of the languageservice-tester…",
                        () =>
                        {
                            strictEqual(tester.WorkingDirectory, tester.DefaultWorkspace.WorkspacePath);
                        });
                });

            suite(
                nameof<LanguageServiceTester>((tester) => tester.Install),
                () =>
                {
                    let npmPath: string;
                    let tempGlobalDir: TempDirectory;
                    let globalConfigPath: string;
                    let globalConfigBackup: TempFile;
                    let globalModulePath: string;
                    let tempDir: TempDirectory;
                    let tester: TestLanguageServiceTester;

                    suiteSetup(
                        async function()
                        {
                            this.timeout(1.5 * 60 * 1000);
                            npmPath = npmWhich(__dirname).sync("npm");
                            tempGlobalDir = new TempDirectory();
                            globalConfigPath = JSON.parse(spawnSync(npmPath, ["config", "list", "-g", "--json"]).stdout.toString().trim())["globalconfig"];

                            if (await pathExists(globalConfigPath))
                            {
                                globalConfigBackup = new TempFile();
                                await remove(globalConfigBackup.FullName);
                                await copy(globalConfigPath, globalConfigBackup.FullName);
                            }
                            else
                            {
                                globalConfigBackup = null;
                            }

                            globalModulePath = spawnSync(npmPath, ["prefix", "-g"]).stdout.toString().trim();
                            spawnSync(npmPath, ["set", "-g", "prefix", tempGlobalDir.FullName]);
                            tempDir = new TempDirectory();
                        });

                    suiteTeardown(
                        async function()
                        {
                            this.timeout(45 * 1000);
                            spawnSync(npmPath, ["set", "-g", "prefix", globalModulePath]);
                            await remove(globalConfigPath);

                            if (globalConfigBackup !== null)
                            {
                                await copy(globalConfigBackup.FullName, globalConfigPath);
                                globalConfigBackup.Dispose();
                            }

                            tempGlobalDir.Dispose();
                        });

                    setup(
                        () =>
                        {
                            tester = new TestLanguageServiceTester(tempDir.FullName);
                        });

                    teardown(
                        async function()
                        {
                            this.timeout(5 * 1000);

                            try
                            {
                                await tester.Dispose();
                            }
                            catch { }
                        });

                    test(
                        "Checking whether the necessary dependencies of the tester can be installed…",
                        async function()
                        {
                            this.timeout(1.5 * 60 * 1000);
                            this.slow(1 * 60 * 1000);
                            throws(() => tester.TSServer);
                            await tester.Install();
                            doesNotThrow(() => tester.TSServer);
                        });
                });

            suite(
                nameof<LanguageServiceTester>((tester) => tester.ConfigurePlugin),
                () =>
                {
                    setup(
                        async () =>
                        {
                            await context.ESLintTester.Configure();
                        });

                    test(
                        "Checking whether plugins can be configured…",
                        async function()
                        {
                            this.timeout(1.5 * 60 * 1000);
                            this.slow(45 * 1000);
                            let incorrectCode = "  ";
                            let ruleName = ESLintRule.NoTrailingSpaces;

                            /**
                             * Filters the diagnostics for `eslint`-diagnostics.
                             *
                             * @param response
                             * The response to filter.
                             *
                             * @returns
                             * All diagnostics related to `eslint`.
                             */
                            function FilterESLintDiagnostics(response: DiagnosticsResponseAnalyzer): Diagnostic[]
                            {
                                return response.Diagnostics.filter(
                                    (diagnostic) => diagnostic.Source === Constants.ErrorSource);
                            }

                            context.ESLintTester.Configure(
                                undefined,
                                {
                                    [ruleName]: "warn"
                                });

                            ok(FilterESLintDiagnostics(await context.ESLintTester.AnalyzeCode(incorrectCode, "JS")).length > 0);

                            await context.ESLintTester.ConfigurePlugin(
                                context.ESLintTester.DefaultWorkspace.TypeScriptPluginName,
                                {
                                    ignoreJavaScript: true
                                });

                            strictEqual(FilterESLintDiagnostics(await context.ESLintTester.AnalyzeCode(incorrectCode, "JS")).length, 0);
                        });
                });
        });
}
