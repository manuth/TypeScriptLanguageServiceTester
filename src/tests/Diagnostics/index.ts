import { basename } from "path";
import { ITestContext } from "../ITestContext";
import { ActionTests } from "./Actions";
import { DiagnosticTests as DiagnosticClassTests } from "./Diagnostic.test";
import { DiagnosticResponseAnalyzerTests } from "./DiagnosticResponseAnalyzer.test";

/**
 * Registers tests for diagnostics.
 *
 * @param context
 * The test-context.
 */
export function DiagnosticTests(context: ITestContext): void
{
    suite(
        basename(__dirname),
        () =>
        {
            DiagnosticClassTests(context);
            DiagnosticResponseAnalyzerTests(context);
            ActionTests();
        });
}
