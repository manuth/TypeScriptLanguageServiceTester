import { DiagnosticTests } from "./Diagnostics/index.js";
import { ITestContext } from "./ITestContext.js";
import { LanguageServiceTesterTests } from "./LanguageServiceTester.test.js";
import { TSLintLanguageServiceTester } from "./TSLintLanguageServiceTester.js";
import { TSServerTests } from "./TSServer.test.js";
import { WorkspaceTests } from "./Workspaces/index.js";

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
