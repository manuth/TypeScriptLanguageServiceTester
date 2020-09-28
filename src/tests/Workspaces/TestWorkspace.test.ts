import Assert = require("assert");
import { writeJSON } from "fs-extra";
import { Diagnostic } from "../../Diagnostics/Diagnostic";
import { DiagnosticsResponseAnalyzer } from "../../Diagnostics/DiagnosticsResponseAnalyzer";
import { TestWorkspace } from "../../Workspaces/TestWorkspace";
import { TestLanguageServiceTester } from "../TestLanguageServiceTester";

/**
 * Registers tests for the `TestWorkspace` class.
 */
export function TestWorkspaceTests(): void
{
    suite.only(
        "TestWorkspace",
        () =>
        {
            let tester: TestLanguageServiceTester;
            let workspace: TestWorkspace;

            suiteSetup(
                () =>
                {
                    tester = new TestLanguageServiceTester();
                });

            suiteTeardown(
                async () =>
                {
                    await tester.Dispose();
                });

            setup(
                () =>
                {
                    workspace = new TestWorkspace(tester, tester.WorkingDirectory);
                });

            teardown(
                async () =>
                {
                    await workspace.Dispose();
                });

            suite(
                "ConfigurePlugin",
                () =>
                {
                    test(
                        "Checking whether plugins can be configured…",
                        async function()
                        {
                            this.timeout(1.5 * 60 * 1000);
                            this.slow(45 * 1000);
                            let pluginName = "typescript-eslint-plugin";
                            let incorrectCode = "let x;;;";

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
                                return response.Filter(
                                    (diagnostic) => diagnostic.Source === "eslint");
                            }

                            await writeJSON(
                                workspace.MakePath("tsconfig.json"),
                                {
                                    compilerOptions: {
                                        allowJs: true,
                                        plugins: [
                                            {
                                                name: pluginName,
                                                logLevel: "verbose"
                                            }
                                        ]
                                    }
                                });

                            await writeJSON(
                                workspace.MakePath(".eslintrc"),
                                {
                                    rules: {
                                        "no-extra-semi": "warn"
                                    }
                                });

                            Assert.ok(FilterESLintDiagnostics(await workspace.AnalyzeCode(incorrectCode, "JS")).length > 0);

                            await workspace.ConfigurePlugin(
                                pluginName,
                                {
                                    ignoreJavaScript: true
                                });

                            Assert.strictEqual(
                                FilterESLintDiagnostics(await workspace.AnalyzeCode(incorrectCode, "JS")).length,
                                0);
                        });
                });

            suite(
                "AnalyzeCode",
                () =>
                {
                    test(
                        "Checking whether diagnostics can be looked up…",
                        async function()
                        {
                            this.timeout(1.5 * 60 * 1000);
                            this.slow(45 * 1000);
                            Assert.ok((await tester.AnalyzeCode("let x: sting")).Diagnostics.length > 0);
                        });
                });
        });
}
