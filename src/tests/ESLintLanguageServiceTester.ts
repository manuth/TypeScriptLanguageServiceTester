import { ESLintWorkspace } from "./ESLintWorkspace";
import { TestLanguageServiceTester } from "./TestLanguageServiceTester";

/**
 * Provides the functionality to test the eslint languageservice.
 */
export class ESLintLanguageServiceTester extends TestLanguageServiceTester
{
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
     * @param eslintRules
     * The eslint-rules to apply.
     */
    public async Configure(eslintRules?: Record<string, unknown>): Promise<void>
    {
        return this.DefaultWorkspace.Configure(eslintRules);
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
