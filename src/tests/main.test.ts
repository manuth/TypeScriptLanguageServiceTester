import { ESLintLanguageServiceTester } from "./ESLintLanguageServiceTester";
import { ITestContext } from "./ITestContext";
import { LanguageServiceTesterTests } from "./LanguageServiceTester.test";
import { TSServerTests } from "./TSServer.test";
import { WorkspaceTests } from "./Workspaces";

suite(
    "TypeScriptLanguageServiceTester",
    () =>
    {
        let testContext: ITestContext = {
            ESLintTester: null
        };

        suiteSetup(
            async function()
            {
                this.timeout(1.5 * 60 * 1000);
                this.slow(45 * 1000);
                testContext.ESLintTester = new ESLintLanguageServiceTester();
                await testContext.ESLintTester.Install();
            });

        suiteTeardown(
            async () =>
            {
                await testContext.ESLintTester.Dispose();
            });

        TSServerTests();
        LanguageServiceTesterTests();
        WorkspaceTests(testContext);
    });
