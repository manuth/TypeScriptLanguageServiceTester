import { basename } from "path";
import { ITestContext } from "../ITestContext.js";
import { TestWorkspaceTests } from "./TestWorkspace.test.js";

/**
 * Registers tests for workspaces.
 *
 * @param testContext
 * The test-context.
 */
export function WorkspaceTests(testContext: ITestContext): void
{
    suite(
        basename(new URL(".", import.meta.url).pathname),
        () =>
        {
            TestWorkspaceTests(testContext);
        });
}
