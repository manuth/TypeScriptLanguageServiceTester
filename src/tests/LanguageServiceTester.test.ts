import Assert = require("assert");
import { spawnSync } from "child_process";
import { TempDirectory, TempFile } from "@manuth/temp-files";
import { copy, pathExists, remove } from "fs-extra";
import npmWhich = require("npm-which");
import { TestLanguageServiceTester } from "./TestLanguageServiceTester";

/**
 * Registers tests for the `LanguageServiceTester` class.
 */
export function LanguageServiceTesterTests(): void
{
    suite(
        "LanguageServiceTester",
        () =>
        {
            let tester: TestLanguageServiceTester;

            setup(
                () =>
                {
                    tester = new TestLanguageServiceTester();
                });

            teardown(
                async function()
                {
                    this.timeout(10 * 1000);
                    await tester.Dispose();
                });

            suite(
                "DefaultWorkspace",
                () =>
                {
                    test(
                        "Checking whether the default workspace is located at the working directory of the languageservice-tester…",
                        () =>
                        {
                            Assert.strictEqual(tester.WorkingDirectory, tester.DefaultWorkspace.WorkspacePath);
                        });
                });

            suite(
                "Install",
                () =>
                {
                    let npmPath: string;
                    let tempGlobalDir: TempDirectory;
                    let globalConfigPath: string;
                    let globalConfigBackup: TempFile;
                    let globalModulePath: string;
                    let tempDir: TempDirectory;
                    let tester: TestLanguageServiceTester;

                    suiteSetup(
                        async function()
                        {
                            this.timeout(1.5 * 60 * 1000);
                            npmPath = npmWhich(__dirname).sync("npm");
                            tempGlobalDir = new TempDirectory();
                            globalConfigPath = JSON.parse(spawnSync(npmPath, ["config", "list", "-g", "--json"]).stdout.toString().trim())["globalconfig"];

                            if (await pathExists(globalConfigPath))
                            {
                                globalConfigBackup = new TempFile();
                                await remove(globalConfigBackup.FullName);
                                await copy(globalConfigPath, globalConfigBackup.FullName);
                            }
                            else
                            {
                                globalConfigBackup = null;
                            }

                            globalModulePath = spawnSync(npmPath, ["prefix", "-g"]).stdout.toString().trim();
                            spawnSync(npmPath, ["set", "-g", "prefix", tempGlobalDir.FullName]);
                            tempDir = new TempDirectory();
                        });

                    suiteTeardown(
                        async function()
                        {
                            this.timeout(45 * 1000);
                            spawnSync(npmPath, ["set", "-g", "prefix", globalModulePath]);
                            await remove(globalConfigPath);

                            if (globalConfigBackup !== null)
                            {
                                await copy(globalConfigBackup.FullName, globalConfigPath);
                                globalConfigBackup.Dispose();
                            }

                            tempGlobalDir.Dispose();
                        });

                    setup(
                        () =>
                        {
                            tester = new TestLanguageServiceTester(tempDir.FullName);
                        });

                    teardown(
                        async function()
                        {
                            this.timeout(5 * 1000);

                            try
                            {
                                await tester.Dispose();
                            }
                            catch { }
                        });

                    test(
                        "Checking whether the necessary dependencies of the tester can be installed…",
                        async function()
                        {
                            this.timeout(1.5 * 60 * 1000);
                            this.slow(1 * 60 * 1000);
                            Assert.throws(() => tester.TSServer);
                            await tester.Install();
                            Assert.doesNotThrow(() => tester.TSServer);
                        });
                });
        });
}
