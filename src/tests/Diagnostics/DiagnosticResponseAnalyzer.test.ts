import { ok, strictEqual } from "assert";
import isEqual = require("lodash.isequal");
import { DiagnosticsResponseAnalyzer } from "../../Diagnostics/DiagnosticsResponseAnalyzer";
import { ESLintLanguageServiceTester } from "../ESLintLanguageServiceTester";
import { ITestContext } from "../ITestContext";

/**
 * Registers tests for the {@link DiagnosticsResponseAnalyzer `DiagnosticsResponseAnalyzer`} class.
 *
 * @param context
 * The test-context.
 */
export function DiagnosticResponseAnalyzerTests(context: ITestContext): void
{
    suite(
        "DiagnosticsResponseAnalyzer",
        () =>
        {
            let tester: ESLintLanguageServiceTester;
            let fixableRule1: string;
            let fixableRule2: string;
            let incorrectCode1: string;
            let incorrectCode2: string;
            let response: DiagnosticsResponseAnalyzer;

            suiteSetup(
                async () =>
                {
                    tester = context.ESLintTester;
                    fixableRule1 = "no-extra-semi";
                    fixableRule2 = "spaced-comment";
                    incorrectCode1 = "let x;;;";
                    incorrectCode2 = "//Hello World";

                    await tester.Configure(
                        {
                            [fixableRule1]: "warn",
                            [fixableRule2]: "warn"
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
                "Diagnostics",
                () =>
                {
                    test(
                        "Checking whether all diagnostics are returned…",
                        () =>
                        {
                            strictEqual(response.Diagnostics.length, response.DiagnosticsResponse.body.length);
                        });
                });

            suite(
                "GetCodeFixes",
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
