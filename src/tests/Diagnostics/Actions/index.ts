import { CodeActionTests } from "./CodeAction.test";
import { FixResponseAnalyzerTests } from "./FixResponseAnalyzer.test";

/**
 * Registers tests for actions.
 */
export function ActionTests(): void
{
    suite(
        "Actions",
        () =>
        {
            CodeActionTests();
            FixResponseAnalyzerTests();
        });
}
