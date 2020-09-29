import { CodeActionTests } from "./CodeAction.test";

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
        });
}
