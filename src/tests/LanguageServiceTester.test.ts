import { doesNotThrow, ok, strictEqual, throws } from "node:assert";
import { spawnSync } from "node:child_process";
import { fileURLToPath } from "node:url";
import { TempDirectory, TempFile } from "@manuth/temp-files";
import { copy, pathExists, remove } from "fs-extra";
import npmWhich from "npm-which";
import { Diagnostic } from "../Diagnostics/Diagnostic.js";
import { DiagnosticsResponseAnalyzer } from "../Diagnostics/DiagnosticsResponseAnalyzer.js";
import type { LanguageServiceTester } from "../LanguageServiceTester.js";
import { ITestContext } from "./ITestContext.js";
import { TestLanguageServiceTester } from "./TestLanguageServiceTester.js";

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
                    let globalConfigBackup: TempFile | null;
                    let globalModulePath: string;
                    let tempDir: TempDirectory;
                    let tester: TestLanguageServiceTester;

                    suiteSetup(
                        async function()
                        {
                            this.timeout(1.5 * 60 * 1000);
                            npmPath = npmWhich(fileURLToPath(new URL(".", import.meta.url))).sync("npm");
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
                            await context.TSLintTester.Configure();
                        });

                    test(
                        "Checking whether plugins can be configured…",
                        async function()
                        {
                            this.timeout(1.5 * 60 * 1000);
                            this.slow(45 * 1000);
                            let incorrectCode = "  ";
                            let ruleName = "no-trailing-whitespace";

                            /**
                             * Filters the diagnostics for `tslint`-diagnostics.
                             *
                             * @param response
                             * The response to filter.
                             *
                             * @returns
                             * All diagnostics related to `tslint`.
                             */
                            function FilterTSLintDiagnostics(response: DiagnosticsResponseAnalyzer): Diagnostic[]
                            {
                                return response.Diagnostics.filter(
                                    (diagnostic) => diagnostic.Source === "tslint");
                            }

                            context.TSLintTester.Configure(
                                undefined,
                                {
                                    rules: {
                                        [ruleName]: true
                                    }
                                });

                            strictEqual(FilterTSLintDiagnostics(await context.TSLintTester.AnalyzeCode(incorrectCode, "JS")).length, 0);

                            await context.TSLintTester.ConfigurePlugin(
                                context.TSLintTester.DefaultWorkspace.TypeScriptPluginName,
                                {
                                    jsEnable: true
                                });

                            ok(FilterTSLintDiagnostics(await context.TSLintTester.AnalyzeCode(incorrectCode, "JS")).length > 0);
                        });
                });
        });
}
