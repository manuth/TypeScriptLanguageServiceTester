import Assert = require("assert");
import { server } from "typescript/lib/tsserverlibrary";
import { FixResponseAnalyzer } from "../../Diagnostics/Actions/FixResponseAnalyzer";
import { Diagnostic } from "../../Diagnostics/Diagnostic";
import { ESLintLanguageServiceTester } from "../ESLintLanguageServiceTester";
import { ITestContext } from "../ITestContext";

/**
 * Registers tests for the `Diagnostic` class.
 *
 * @param context
 * The test-context.
 */
export function DiagnosticTests(context: ITestContext): void
{
    suite(
        "Diagnostic",
        () =>
        {
            let tester: ESLintLanguageServiceTester;
            let fixableRule: string;
            let incorrectCode: string;
            let diagnostic: server.protocol.Diagnostic;
            let diagnosticWrapper: Diagnostic;
            let diagnosticWithLinePosition: server.protocol.DiagnosticWithLinePosition;
            let diagnosticWithLinePositionWrapper: Diagnostic;

            suiteSetup(
                async () =>
                {
                    tester = context.ESLintTester;
                    fixableRule = "no-extra-semi";
                    incorrectCode = "let x;;;";

                    await tester.Configure(
                        {
                            [fixableRule]: "warn"
                        });
                });

            setup(
                async function()
                {
                    this.timeout(20 * 1000);
                    let response = await tester.AnalyzeCode(incorrectCode);

                    let eslintFilter = (rawResponse: server.protocol.SemanticDiagnosticsSyncResponse): Array<server.protocol.Diagnostic | server.protocol.DiagnosticWithLinePosition> =>
                    {
                        let result: Array<server.protocol.Diagnostic | server.protocol.DiagnosticWithLinePosition> = [];

                        for (let diagnostic of rawResponse.body)
                        {
                            let parsedDiagnostic = new Diagnostic(response, diagnostic);

                            if (
                                parsedDiagnostic.Source === "eslint" &&
                                parsedDiagnostic.Message.includes(fixableRule))
                            {
                                result.push(diagnostic);
                            }
                        }

                        return result;
                    };

                    diagnostic = eslintFilter(await tester.TSServer.Send<server.protocol.SemanticDiagnosticsSyncRequest>(
                        {
                            type: "request",
                            command: server.protocol.CommandTypes.SemanticDiagnosticsSync,
                            arguments: {
                                file: response.FileName,
                                includeLinePosition: false
                            }
                        },
                        true))[0] as any;

                    diagnosticWithLinePosition = eslintFilter(await tester.TSServer.Send<server.protocol.SemanticDiagnosticsSyncRequest>(
                        {
                            type: "request",
                            command: server.protocol.CommandTypes.SemanticDiagnosticsSync,
                            arguments: {
                                file: response.FileName,
                                includeLinePosition: true
                            }
                        },
                        true))[0] as any;

                    diagnosticWrapper = new Diagnostic(response, diagnostic);
                    diagnosticWithLinePositionWrapper = new Diagnostic(response, diagnosticWithLinePosition);
                });

            suite(
                "Diagnostic",
                () =>
                {
                    test(
                        "Checking whether the `Diagnostic` property resolves to the original diagnostic…",
                        () =>
                        {
                            Assert.strictEqual(diagnosticWrapper.Diagnostic, diagnostic);
                            Assert.strictEqual(diagnosticWithLinePositionWrapper.Diagnostic, diagnosticWithLinePosition);
                        });
                });

            let properties: Array<keyof Diagnostic> = [
                "Start",
                "End",
                "Code",
                "Source",
                "Message",
                "Category",
                "RelatedInformation"
            ];

            for (let property of properties)
            {
                suite(
                    property,
                    () =>
                    {
                        test(
                            `Checking whether the \`${property}\`-property is resolved correctly for all kinds of diagnostics…`,
                            () =>
                            {
                                Assert.deepStrictEqual(
                                    diagnosticWrapper[property],
                                    diagnosticWithLinePositionWrapper[property]);
                            });
                    });
            }

            suite(
                "IsNormalDiagnostic",
                () =>
                {
                    test(
                        "Checking whether the method determines whether a diagnostic is normal correctly…",
                        () =>
                        {
                            Assert.ok(Diagnostic.IsNormalDiagnostic(diagnostic));
                            Assert.ok(!Diagnostic.IsNormalDiagnostic(diagnosticWithLinePosition));
                        });
                });

            suite(
                "GetCodeFixes",
                () =>
                {
                    let fixResponse: FixResponseAnalyzer;
                    let fixWithLinePositionResponse: FixResponseAnalyzer;

                    setup(
                        async () =>
                        {
                            fixResponse = await diagnosticWrapper.GetCodeFixes();
                            fixWithLinePositionResponse = await diagnosticWithLinePositionWrapper.GetCodeFixes();
                        });

                    test(
                        "Checking whether code-fixes for a diagnostic can be looked up…",
                        () =>
                        {
                            Assert.ok(fixResponse.Fixes.length > 0);
                            Assert.ok(fixWithLinePositionResponse.Fixes.length > 0);
                        });

                    test(
                        "Checking whether code-fixes are looked up correctly for all sorts of diagnostics…",
                        () =>
                        {
                            Assert.strictEqual(fixResponse.Fixes.length, fixWithLinePositionResponse.Fixes.length);
                        });
                });
        });
}
