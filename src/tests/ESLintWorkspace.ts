import { Package } from "@manuth/package-json-editor";
import { Linter } from "eslint";
import { writeJSON } from "fs-extra";
import merge = require("lodash.merge");
import { TSConfigJSON } from "types-tsconfig";
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
     * @param tsConfig
     * The TypeScript-settings to apply.
     *
     * @param eslintRules
     * The eslint-rules to apply.
     */
    public override async Configure(tsConfig?: TSConfigJSON, eslintRules?: Linter.RulesRecord): Promise<void>
    {
        await super.Configure(
            merge<TSConfigJSON, TSConfigJSON>(
                {
                    compilerOptions: {
                        allowJs: true,
                        plugins: [
                            {
                                name: this.TypeScriptPluginName
                            }
                        ]
                    }
                },
                tsConfig));

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
            } as Linter.Config);
    }
}
