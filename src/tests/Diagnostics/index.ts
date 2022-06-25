import { basename } from "node:path";
import { ITestContext } from "../ITestContext.js";
import { ActionTests } from "./Actions/index.js";
import { DiagnosticTests as DiagnosticClassTests } from "./Diagnostic.test.js";
import { DiagnosticsResponseAnalyzerTests } from "./DiagnosticsResponseAnalyzer.test.js";

/**
 * Registers tests for diagnostics.
 *
 * @param context
 * The test-context.
 */
export function DiagnosticTests(context: ITestContext): void
{
    suite(
        basename(new URL(".", import.meta.url).pathname),
        () =>
        {
            DiagnosticClassTests(context);
            DiagnosticsResponseAnalyzerTests(context);
            ActionTests();
        });
}
