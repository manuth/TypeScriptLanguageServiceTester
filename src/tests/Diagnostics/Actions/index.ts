import { basename } from "path";
import { CodeActionTests } from "./CodeAction.test";
import { FixResponseAnalyzerTests } from "./FixResponseAnalyzer.test";

/**
 * Registers tests for actions.
 */
export function ActionTests(): void
{
    suite(
        basename(__dirname),
        () =>
        {
            CodeActionTests();
            FixResponseAnalyzerTests();
        });
}
