import { ok, strictEqual } from "node:assert";
import isEqual from "lodash.isequal";
import { DiagnosticsResponseAnalyzer } from "../../Diagnostics/DiagnosticsResponseAnalyzer.js";
import { ITestContext } from "../ITestContext.js";
import { TSLintLanguageServiceTester } from "../TSLintLanguageServiceTester.js";

/**
 * Registers tests for the {@link DiagnosticsResponseAnalyzer `DiagnosticsResponseAnalyzer`} class.
 *
 * @param context
 * The test-context.
 */
export function DiagnosticsResponseAnalyzerTests(context: ITestContext): void
{
    suite(
        nameof(DiagnosticsResponseAnalyzer),
        () =>
        {
            let tester: TSLintLanguageServiceTester;
            let fixableRule1: string;
            let fixableRule2: string;
            let incorrectCode1: string;
            let incorrectCode2: string;
            let response: DiagnosticsResponseAnalyzer;

            suiteSetup(
                async () =>
                {
                    tester = context.TSLintTester;
                    fixableRule1 = "no-trailing-whitespace";
                    fixableRule2 = "comment-format";
                    incorrectCode1 = "  ";
                    incorrectCode2 = "//Hello World";

                    await tester.Configure(
                        undefined,
                        {
                            [fixableRule1]: true,
                            [fixableRule2]: {
                                "check-space": true
                            }
                        });
                });

            setup(
                async () =>
                {
                    response = await tester.AnalyzeCode(
                        `
                            ${incorrectCode1}
                            ${incorrectCode2}`);
                });

            suite(
                nameof<DiagnosticsResponseAnalyzer>((analyzer) => analyzer.Diagnostics),
                () =>
                {
                    test(
                        "Checking whether all diagnostics are returned…",
                        () =>
                        {
                            strictEqual(
                                response.Diagnostics.length,
                                [
                                    ...(response.CodeAnalysisResult.SemanticDiagnosticsResponse.body ?? []),
                                    ...(response.CodeAnalysisResult.SyntacticDiagnosticsResponse.body ?? [])
                                ].length);
                        });
                });

            suite(
                nameof<DiagnosticsResponseAnalyzer>((analyzer) => analyzer.GetCodeFixes),
                () =>
                {
                    test(
                        "Checking whether code-fixes for all diagnostics are returned…",
                        async () =>
                        {
                            let fixes = await response.GetCodeFixes();

                            ok(
                                (await Promise.all(
                                    response.Diagnostics.flatMap(
                                        (diagnostic) =>
                                        {
                                            return diagnostic.GetCodeFixes();
                                        }))).every(
                                            (response) =>
                                            {
                                                return response.Fixes.every(
                                                    (fix) => fixes.some(
                                                        (sourceFix) => isEqual(fix, sourceFix)));
                                            }));
                        });
                });
        });
}
