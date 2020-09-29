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
    public get DefaultWorkspace(): ESLintWorkspace
    {
        return super.DefaultWorkspace as ESLintWorkspace;
    }

    /**
     * @inheritdoc
     */
    public get TempWorkspaces(): readonly ESLintWorkspace[]
    {
        return super.TempWorkspaces as ESLintWorkspace[];
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
    protected CreateWorkspace(workspacePath: string): ESLintWorkspace
    {
        return new ESLintWorkspace(this, workspacePath);
    }
}
