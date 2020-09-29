import Assert = require("assert");
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
