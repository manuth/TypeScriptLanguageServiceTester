import upath from "upath";
import { Constants } from "../Constants.js";

const { join } = upath;

/**
 * Provides constants for the end-to-end tests.
 */
export class TestConstants
{
    /**
     * Gets the path to a folder for running the test-workspace.
     */
    public static readonly TestWorkspaceDirectory = join(Constants.PackageDirectory, "test");

    /**
     * Gets the name of an event for testing.
     */
    public static readonly TestEvent = "typingsInstallerPid";
}
