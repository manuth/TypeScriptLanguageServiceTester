import { basename } from "path";
import { CodeActionTests } from "./CodeAction.test.js";
import { FixResponseAnalyzerTests } from "./FixResponseAnalyzer.test.js";

/**
 * Registers tests for actions.
 */
export function ActionTests(): void
{
    suite(
        basename(new URL(".", import.meta.url).pathname),
        () =>
        {
            CodeActionTests();
            FixResponseAnalyzerTests();
        });
}
