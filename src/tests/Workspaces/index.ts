import { TestWorkspaceTests } from "./TestWorkspace.test";

/**
 * Registers tests for workspaces.
 */
export function WorkspaceTests(): void
{
    suite(
        "Workspaces",
        () =>
        {
            TestWorkspaceTests();
        });
}
