import { LanguageServiceTester } from "../LanguageServiceTester";
import { TestConstants } from "./TestConstants";

/**
 * Provides an implementation of the `LanguageServiceTester` class for testing.
 */
export class TestLanguageServiceTester extends LanguageServiceTester
{
    /**
     * The error-codes to test.
     */
    private errorCodes: number[] = [];

    /**
     * Initializes a new instance of the `TestLanguageServiceTester` class.
     *
     * @param workingDirectory
     * The working directory to set for the default workspace.
     */
    public constructor(workingDirectory = TestConstants.TestWorkspaceDirectory)
    {
        super(workingDirectory);
    }

    /**
     * @inheritdoc
     */
    public get ErrorCodes(): number[]
    {
        return this.errorCodes;
    }

    /**
     * @inheritdoc
     */
    public set ErrorCodes(value)
    {
        this.errorCodes = value;
    }
}
