import { TSConfigJSON } from "types-tsconfig";
import { ESLintWorkspace } from "./ESLintWorkspace";
import { TestLanguageServiceTester } from "./TestLanguageServiceTester";

/**
 * Provides the functionality to test the eslint languageservice.
 */
export class ESLintLanguageServiceTester extends TestLanguageServiceTester
{
    /**
     * Initializes a new instance of the {@link ESLintLanguageServiceTester `ESLintLanguageServiceTester`} class.
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
    public override get DefaultWorkspace(): ESLintWorkspace
    {
        return super.DefaultWorkspace as ESLintWorkspace;
    }

    /**
     * @inheritdoc
     */
    public override get TempWorkspaces(): readonly ESLintWorkspace[]
    {
        return super.TempWorkspaces as ESLintWorkspace[];
    }

    /**
     * Configures the default workspace.
     *
     * @param tsConfig
     * The TypeScript-settings to apply.
     *
     * @param eslintRules
     * The eslint-rules to apply.
     */
    public override async Configure(tsConfig?: TSConfigJSON, eslintRules?: Record<string, unknown>): Promise<void>
    {
        return this.DefaultWorkspace.Configure(tsConfig, eslintRules);
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
    protected override CreateWorkspace(workspacePath: string): ESLintWorkspace
    {
        return new ESLintWorkspace(this, workspacePath);
    }
}
