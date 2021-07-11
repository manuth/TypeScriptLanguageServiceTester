import { deepStrictEqual, ok, strictEqual } from "assert";
import { ESLintRule } from "@manuth/eslint-plugin-typescript";
import { Constants } from "@manuth/typescript-eslint-plugin";
import { server } from "typescript/lib/tsserverlibrary";
import { FixResponseAnalyzer } from "../../Diagnostics/Actions/FixResponseAnalyzer";
import { Diagnostic } from "../../Diagnostics/Diagnostic";
import { ESLintLanguageServiceTester } from "../ESLintLanguageServiceTester";
import { ITestContext } from "../ITestContext";

/**
 * Registers tests for the {@link Diagnostic `Diagnostic`} class.
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
                    fixableRule = ESLintRule.NoTrailingSpaces;
                    incorrectCode = "  ";

                    await tester.Configure(
                        undefined,
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
                                parsedDiagnostic.Source === Constants.ErrorSource &&
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
