import { join } from "upath";
import { Constants } from "../Constants";

/**
 * Provides constants for the end-to-end tests.
 */
export class TestConstants
{
    /**
     * Gets the path to a folder for running the test-workspace.
     */
    public static readonly TestWorkspaceDirectory = join(Constants.PackageDirectory, "test");
}
