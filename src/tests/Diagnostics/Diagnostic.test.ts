import { deepStrictEqual, ok, strictEqual } from "node:assert";
import ts from "typescript/lib/tsserverlibrary.js";
import { FixResponseAnalyzer } from "../../Diagnostics/Actions/FixResponseAnalyzer.js";
import { Diagnostic } from "../../Diagnostics/Diagnostic.js";
import { ITestContext } from "../ITestContext.js";
import { TSLintLanguageServiceTester } from "../TSLintLanguageServiceTester.js";

/**
 * Registers tests for the {@linkcode Diagnostic} class.
 *
 * @param context
 * The test-context.
 */
export function DiagnosticTests(context: ITestContext): void
{
    suite(
        nameof(Diagnostic),
        () =>
        {
            let tester: TSLintLanguageServiceTester;
            let fixableRule: string;
            let incorrectCode: string;
            let diagnostic: ts.server.protocol.Diagnostic;
            let diagnosticWrapper: Diagnostic;
            let diagnosticWithLinePosition: ts.server.protocol.DiagnosticWithLinePosition;
            let diagnosticWithLinePositionWrapper: Diagnostic;

            suiteSetup(
                async () =>
                {
                    tester = context.TSLintTester;
                    fixableRule = "no-trailing-whitespace";
                    incorrectCode = "  ";

                    await tester.Configure(
                        undefined,
                        {
                            rules: {
                                [fixableRule]: true
                            }
                        });
                });

            setup(
                async function()
                {
                    this.timeout(20 * 1000);
                    let response = await tester.AnalyzeCode(incorrectCode);

                    let tslintFilter = (rawResponse: ts.server.protocol.SemanticDiagnosticsSyncResponse): Array<ts.server.protocol.Diagnostic | ts.server.protocol.DiagnosticWithLinePosition> =>
                    {
                        let result: Array<ts.server.protocol.Diagnostic | ts.server.protocol.DiagnosticWithLinePosition> = [];

                        for (let diagnostic of rawResponse.body ?? [])
                        {
                            let parsedDiagnostic = new Diagnostic(response, diagnostic);

                            if (
                                parsedDiagnostic.Source === "tslint" &&
                                parsedDiagnostic.Message.includes(fixableRule))
                            {
                                result.push(diagnostic);
                            }
                        }

                        return result;
                    };

                    diagnostic = tslintFilter(await tester.TSServer.Send<ts.server.protocol.SemanticDiagnosticsSyncRequest>(
                        {
                            type: "request",
                            command: ts.server.protocol.CommandTypes.SemanticDiagnosticsSync,
                            arguments: {
                                file: response.FileName,
                                includeLinePosition: false
                            }
                        },
                        true))[0] as any;

                    diagnosticWithLinePosition = tslintFilter(await tester.TSServer.Send<ts.server.protocol.SemanticDiagnosticsSyncRequest>(
                        {
                            type: "request",
                            command: ts.server.protocol.CommandTypes.SemanticDiagnosticsSync,
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
                nameof<Diagnostic>((diagnostic) => diagnostic.Diagnostic),
                () =>
                {
                    test(
                        `Checking whether the \`${nameof<Diagnostic>((d) => d.Diagnostic)}\` property resolves to the original diagnostic…`,
                        () =>
                        {
                            strictEqual(diagnosticWrapper.Diagnostic, diagnostic);
                            strictEqual(diagnosticWithLinePositionWrapper.Diagnostic, diagnosticWithLinePosition);
                        });
                });

            let properties = [
                nameof<Diagnostic>((diagnostic) => diagnostic.Start),
                nameof<Diagnostic>((diagnostic) => diagnostic.End),
                nameof<Diagnostic>((diagnostic) => diagnostic.Code),
                nameof<Diagnostic>((diagnostic) => diagnostic.Source),
                nameof<Diagnostic>((diagnostic) => diagnostic.Message),
                nameof<Diagnostic>((diagnostic) => diagnostic.Category),
                nameof<Diagnostic>((diagnostic) => diagnostic.RelatedInformation)
            ] as Array<keyof Diagnostic>;

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
                                deepStrictEqual(
                                    diagnosticWrapper[property],
                                    diagnosticWithLinePositionWrapper[property]);
                            });
                    });
            }

            suite(
                nameof(Diagnostic.IsNormalDiagnostic),
                () =>
                {
                    test(
                        "Checking whether the method determines whether a diagnostic is normal correctly…",
                        () =>
                        {
                            ok(Diagnostic.IsNormalDiagnostic(diagnostic));
                            ok(!Diagnostic.IsNormalDiagnostic(diagnosticWithLinePosition));
                        });
                });

            suite(
                nameof<Diagnostic>((diagnostic) => diagnostic.GetCodeFixes),
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
                            ok(fixResponse.Fixes.length > 0);
                            ok(fixWithLinePositionResponse.Fixes.length > 0);
                        });

                    test(
                        "Checking whether code-fixes are looked up correctly for all sorts of diagnostics…",
                        () =>
                        {
                            strictEqual(fixResponse.Fixes.length, fixWithLinePositionResponse.Fixes.length);
                        });
                });
        });
}
