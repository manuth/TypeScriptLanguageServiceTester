import { LanguageServiceTester } from "../LanguageServiceTester";
import { TestConstants } from "./TestConstants";

/**
 * Provides an implementation of the {@link LanguageServiceTester `LanguageServiceTester`} class for testing.
 */
export class TestLanguageServiceTester extends LanguageServiceTester
{
    /**
     * Initializes a new instance of the {@link TestLanguageServiceTester `TestLanguageServiceTester`} class.
     *
     * @param workingDirectory
     * The working directory to set for the default workspace.
     */
    public constructor(workingDirectory = TestConstants.TestWorkspaceDirectory)
    {
        super(workingDirectory);
    }
}
