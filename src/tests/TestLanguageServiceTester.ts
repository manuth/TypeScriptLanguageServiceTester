import { TestConstants } from "./TestConstants.js";
import { LanguageServiceTester } from "../LanguageServiceTester.js";

/**
 * Provides an implementation of the {@linkcode LanguageServiceTester} class for testing.
 */
export class TestLanguageServiceTester extends LanguageServiceTester
{
    /**
     * Initializes a new instance of the {@linkcode TestLanguageServiceTester} class.
     *
     * @param workingDirectory
     * The working directory to set for the default workspace.
     */
    public constructor(workingDirectory = TestConstants.TestWorkspaceDirectory)
    {
        super(workingDirectory);
    }
}
