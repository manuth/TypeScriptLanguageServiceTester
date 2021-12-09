import { Configuration } from "tslint";
import { TSConfigJSON } from "types-tsconfig";
import { TestLanguageServiceTester } from "./TestLanguageServiceTester";
import { TSLintWorkspace } from "./TSLintWorkspace";

/**
 * Provides the functionality to test the tslint languageservice.
 */
export class TSLintLanguageServiceTester extends TestLanguageServiceTester
{
    /**
     * Initializes a new instance of the {@link TSLintLanguageServiceTester `TSLintLanguageServiceTester`} class.
     *
     * @param workingDirectory
     * The working directory to set for the default workspace.
     */
    public constructor(workingDirectory?: string)
    {
        super(workingDirectory);
    }

    /**
     * @inheritdoc
     */
    public override get DefaultWorkspace(): TSLintWorkspace
    {
        return super.DefaultWorkspace as TSLintWorkspace;
    }

    /**
     * @inheritdoc
     */
    public override get TempWorkspaces(): readonly TSLintWorkspace[]
    {
        return super.TempWorkspaces as TSLintWorkspace[];
    }

    /**
     * Configures the default workspace.
     *
     * @param tsConfig
     * The TypeScript-settings to apply.
     *
     * @param tslintConfig
     * The tslint configuration to apply.
     */
    public override async Configure(tsConfig?: TSConfigJSON, tslintConfig?: Configuration.RawConfigFile): Promise<void>
    {
        return this.DefaultWorkspace.Configure(tsConfig, tslintConfig);
    }

    /**
     * @inheritdoc
     *
     * @param workspacePath
     * The path to the workspace to create.
     *
     * @returns
     * The newly created workspace.
     */
    protected override CreateWorkspace(workspacePath: string): TSLintWorkspace
    {
        return new TSLintWorkspace(this, workspacePath);
    }
}
