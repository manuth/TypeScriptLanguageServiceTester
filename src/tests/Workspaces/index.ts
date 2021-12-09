import { basename } from "path";
import { ITestContext } from "../ITestContext";
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
        basename(__dirname),
        () =>
        {
            TestWorkspaceTests(testContext);
        });
}
