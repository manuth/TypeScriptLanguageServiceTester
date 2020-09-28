import Assert = require("assert");
import { Diagnostic } from "../../Diagnostics/Diagnostic";
import { DiagnosticsResponseAnalyzer } from "../../Diagnostics/DiagnosticsResponseAnalyzer";
import { TestWorkspace } from "../../Workspaces/TestWorkspace";
import { ITestContext } from "../ITestContext";
import { TestLanguageServiceTester } from "../TestLanguageServiceTester";

/**
 * Registers tests for the `TestWorkspace` class.
 *
 * @param testContext
 * The test-context.
 */
export function TestWorkspaceTests(testContext: ITestContext): void
{
    suite(
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
                    setup(
                        async () =>
                        {
                            workspace = new TestWorkspace(testContext.ESLintTester, testContext.ESLintTester.WorkingDirectory);
                            await testContext.ESLintTester.Configure(workspace);
                        });

                    teardown(
                        async () =>
                        {
                            await workspace.Dispose();
                        });

                    test(
                        "Checking whether plugins can be configured…",
                        async function()
                        {
                            this.timeout(1.5 * 60 * 1000);
                            this.slow(45 * 1000);
                            let incorrectCode = "let x;;;";
                            let ruleName = "no-extra-semi";

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

                            testContext.ESLintTester.Configure(
                                workspace,
                                {
                                    [ruleName]: "warn"
                                });

                            Assert.ok(FilterESLintDiagnostics(await workspace.AnalyzeCode(incorrectCode, "JS")).length > 0);

                            await workspace.ConfigurePlugin(
                                testContext.ESLintTester.TypeScriptPluginName,
                                {
                                    ignoreJavaScript: true
                                });

                            Assert.strictEqual(FilterESLintDiagnostics(await workspace.AnalyzeCode(incorrectCode, "JS")).length, 0);
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
