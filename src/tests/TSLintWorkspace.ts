import { Package } from "@manuth/package-json-editor";
import { writeJSON } from "fs-extra";
import merge = require("lodash.merge");
import { Configuration } from "tslint";
import { TSConfigJSON } from "types-tsconfig";
import { Constants } from "../Constants";
import { TestWorkspace } from "../Workspaces/TestWorkspace";

/**
 * Represents an tslint-workspace.
 */
export class TSLintWorkspace extends TestWorkspace
{
    /**
     * Gets the name of the typescript-plugin.
     */
    public get TypeScriptPluginName(): string
    {
        return "typescript-tslint-plugin";
    }

    /**
     * @inheritdoc
     */
    public override get InstallerPackage(): Package
    {
        let result = super.InstallerPackage;
        let basePackage = Constants.Package;

        let dependencies = [
            "tslint",
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
     * @param tslintConfig
     * The tslint configuration to apply.
     */
    public override async Configure(tsConfig?: TSConfigJSON, tslintConfig?: Configuration.RawConfigFile): Promise<void>
    {
        await Promise.all(
            [
                super.Configure(
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
                        tsConfig)),
                writeJSON(
                    this.MakePath(Configuration.JSON_CONFIG_FILENAME),
                    {
                        ...tslintConfig
                    })
            ]);
    }
}
