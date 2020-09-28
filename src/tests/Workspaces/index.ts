import { ITestContext } from "../ITestContext";
import { TempWorkspaceTests } from "./TempWorkspace.test";
import { TestWorkspaceTests } from "./TestWorkspace.test";

/**
 * Registers tests for workspaces.
 *
 * @param testContext
 * The test-context.
 */
export function WorkspaceTests(testContext: ITestContext): void
{
    suite(
        "Workspaces",
        () =>
        {
            TestWorkspaceTests(testContext);
            TempWorkspaceTests();
        });
}
