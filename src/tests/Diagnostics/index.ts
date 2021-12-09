import { basename } from "path";
import { ITestContext } from "../ITestContext";
import { ActionTests } from "./Actions";
import { DiagnosticTests as DiagnosticClassTests } from "./Diagnostic.test";
import { DiagnosticsResponseAnalyzerTests } from "./DiagnosticsResponseAnalyzer.test";

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
            DiagnosticsResponseAnalyzerTests(context);
            ActionTests();
        });
}
