import { ITestContext } from "../ITestContext";
import { DiagnosticTests as DiagnosticClassTests } from "./Diagnostic.test";

/**
 * Registers tests for diagnostics.
 *
 * @param context
 * The test-context.
 */
export function DiagnosticTests(context: ITestContext): void
{
    suite(
        "Diagnostics",
        () =>
        {
            DiagnosticClassTests(context);
        });
}
