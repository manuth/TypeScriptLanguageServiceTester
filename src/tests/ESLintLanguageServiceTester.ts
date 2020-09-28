import { Package } from "@manuth/package-json-editor";
import { writeJSON } from "fs-extra";
import { Constants } from "../Constants";
import { TestWorkspace } from "../Workspaces/TestWorkspace";
import { TestLanguageServiceTester } from "./TestLanguageServiceTester";

/**
 * Provides the functionality to test the eslint languageservice.
 */
export class ESLintLanguageServiceTester extends TestLanguageServiceTester
{
    /**
     * Gets the name of the typescript-plugin.
     */
    public get TypeScriptPluginName(): string
    {
        return "typescript-eslint-plugin";
    }

    /**
     * @inheritdoc
     */
    public get InstallerPackage(): Package
    {
        let result = super.InstallerPackage;
        let basePackage = Constants.Package;

        let dependencies = [
            "eslint",
            this.TypeScriptPluginName
        ];

        for (let dependency of dependencies)
        {
            result.DevelpomentDependencies.Add(
                dependency,
                basePackage.AllDependencies.Get(dependency));
        }

        return basePackage;
    }

    /**
     * @inheritdoc
     */
    public async Install(): Promise<void>
    {
        await super.Install();
        return this.Configure(this.DefaultWorkspace);
    }

    /**
     * Configures thespecified `workspace`.
     *
     * @param workspace
     * The workspace to configure.
     *
     * @param eslintRules
     * The eslint-rules to configure.
     */
    public async Configure(workspace: TestWorkspace, eslintRules?: Record<string, any>): Promise<void>
    {
        await writeJSON(
            workspace.MakePath("tsconfig.json"),
            {
                compilerOptions: {
                    allowJs: true,
                    plugins: [
                        {
                            name: this.TypeScriptPluginName
                        }
                    ]
                }
            });

        return writeJSON(
            workspace.MakePath(".eslintrc"),
            {
                root: true,
                env: {
                    node: true,
                    es6: true
                },
                rules: {
                    ...eslintRules
                }
            });
    }
}
