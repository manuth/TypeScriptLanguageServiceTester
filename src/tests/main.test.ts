import { DiagnosticTests } from "./Diagnostics";
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
                testContext.ESLintTester = new ESLintLanguageServiceTester();
                await testContext.ESLintTester.Install();
            });

        suiteTeardown(
            async function()
            {
                this.timeout(10 * 1000);
                await testContext.ESLintTester.Dispose();
            });

        TSServerTests();
        LanguageServiceTesterTests();
        WorkspaceTests(testContext);
        DiagnosticTests(testContext);
    });
