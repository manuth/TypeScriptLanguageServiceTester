import { DiagnosticTests } from "./Diagnostics";
import { ITestContext } from "./ITestContext";
import { LanguageServiceTesterTests } from "./LanguageServiceTester.test";
import { TSLintLanguageServiceTester } from "./TSLintLanguageServiceTester";
import { TSServerTests } from "./TSServer.test";
import { WorkspaceTests } from "./Workspaces";

suite(
    "TypeScriptLanguageServiceTester",
    () =>
    {
        let testContext: ITestContext = {
            TSLintTester: null
        };

        suiteSetup(
            async function()
            {
                this.timeout(1.5 * 60 * 1000);
                testContext.TSLintTester = new TSLintLanguageServiceTester();
                await testContext.TSLintTester.Install();
            });

        suiteTeardown(
            async function()
            {
                this.timeout(10 * 1000);
                await testContext.TSLintTester.Dispose();
            });

        TSServerTests();
        LanguageServiceTesterTests(testContext);
        WorkspaceTests(testContext);
        DiagnosticTests(testContext);
    });
