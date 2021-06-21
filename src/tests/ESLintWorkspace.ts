import { Package } from "@manuth/package-json-editor";
import { writeJSON } from "fs-extra";
import { Constants } from "../Constants";
import { TestWorkspace } from "../Workspaces/TestWorkspace";

/**
 * Represents an eslint-workspace.
 */
export class ESLintWorkspace extends TestWorkspace
{
    /**
     * Gets the name of the typescript-plugin.
     */
    public get TypeScriptPluginName(): string
    {
        return "@manuth/typescript-eslint-plugin";
    }

    /**
     * @inheritdoc
     */
    public override get InstallerPackage(): Package
    {
        let result = super.InstallerPackage;
        let basePackage = Constants.Package;

        let dependencies = [
            "eslint",
            this.TypeScriptPluginName
        ];

        for (let dependency of dependencies)
        {
            if (!result.AllDependencies.Has(dependency))
            {
                result.DevelopmentDependencies.Add(
                    dependency,
                    basePackage.AllDependencies.Get(dependency));
            }
        }

        return result;
    }

    /**
     * Configures the workspace.
     *
     * @param eslintRules
     * The eslint-rules to configure.
     */
    public async Configure(eslintRules?: Record<string, any>): Promise<void>
    {
        await writeJSON(
            this.MakePath("tsconfig.json"),
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
            this.MakePath(".eslintrc"),
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
