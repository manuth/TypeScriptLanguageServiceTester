import { ok, strictEqual } from "assert";
import { Package } from "@manuth/package-json-editor";
import { move, pathExists, remove, writeJSON } from "fs-extra";
import { randexp } from "randexp";
import { TestWorkspace } from "../../Workspaces/TestWorkspace";
import { ITestContext } from "../ITestContext";
import { TestLanguageServiceTester } from "../TestLanguageServiceTester";

/**
 * Registers tests for the {@link TestWorkspace `TestWorkspace`} class.
 *
 * @param testContext
 * The test-context.
 */
export function TestWorkspaceTests(testContext: ITestContext): void
{
    suite(
        nameof(TestWorkspace),
        () =>
        {
            let tester: TestLanguageServiceTester;
            let workspace: TestWorkspace;

            suiteSetup(
                () =>
                {
                    tester = new TestLanguageServiceTester();
                });

            suiteTeardown(
                async () =>
                {
                    await tester.Dispose();
                });

            setup(
                () =>
                {
                    workspace = new TestWorkspace(tester, tester.WorkingDirectory);
                });

            teardown(
                async () =>
                {
                    await workspace.Dispose();
                });

            suite(
                nameof<TestWorkspace>((workspace) => workspace.Install),
                () =>
                {
                    let typeScriptPackageName: string;
                    let versionNumber: string;
                    let packageFileName: string;
                    let tempPackageFileName: string;

                    suiteSetup(
                        async () =>
                        {
                            typeScriptPackageName = "typescript";
                            versionNumber = randexp(/\d+\.\d+\.\d+/);
                            packageFileName = tester.MakePath("package.json");
                            tempPackageFileName = tester.MakePath("_package.json");

                            if (await pathExists(packageFileName))
                            {
                                await move(packageFileName, tempPackageFileName);
                            }
                        });

                    suiteTeardown(
                        async () =>
                        {
                            await remove(packageFileName);
                        });

                    suiteTeardown(
                        async () =>
                        {
                            if (await pathExists(tempPackageFileName))
                            {
                                await move(tempPackageFileName, packageFileName);
                            }
                        });

                    test(
                        "Checking whether a `package.json`-file containing `typescript` is created if it doesn't exist…",
                        async function()
                        {
                            this.slow(10 * 1000);
                            this.timeout(20 * 1000);
                            ok(!(await pathExists(packageFileName)));
                            await workspace.Install();
                            ok(await pathExists(packageFileName));
                            ok(new Package(packageFileName).AllDependencies.Has(typeScriptPackageName));
                        });

                    test(
                        "Checking whether `typescript` is added to existing `package.json`-files if it isn't present…",
                        async function()
                        {
                            this.slow(10 * 1000);
                            this.timeout(20 * 1000);
                            let npmPackage = new Package();
                            npmPackage.FileName = packageFileName;
                            await writeJSON(npmPackage.FileName, npmPackage.ToJSON());
                            ok(!new Package(npmPackage.FileName).AllDependencies.Has(typeScriptPackageName));
                            await workspace.Install();
                            ok(new Package(npmPackage.FileName).AllDependencies.Has(typeScriptPackageName));
                        });

                    test(
                        "Checking whether the `typescript`-dependency version is left untouched if it already exists in the `package.json`-file…",
                        async function()
                        {
                            this.slow(15 * 1000);
                            this.timeout(30 * 1000);
                            let npmPackage = new Package();
                            npmPackage.FileName = packageFileName;
                            npmPackage.Dependencies.Add(typeScriptPackageName, versionNumber);
                            await writeJSON(npmPackage.FileName, npmPackage.ToJSON());
                            await workspace.Install();
                            strictEqual(new Package(npmPackage.FileName).AllDependencies.Get(typeScriptPackageName), versionNumber);
                            npmPackage.Dependencies.Remove(typeScriptPackageName);
                            npmPackage.DevelopmentDependencies.Add(typeScriptPackageName, versionNumber);
                            await writeJSON(npmPackage.FileName, npmPackage.ToJSON());
                            await workspace.Install();
                            strictEqual(new Package(npmPackage.FileName).AllDependencies.Get(typeScriptPackageName), versionNumber);
                        });
                });

            suite(
                nameof<TestWorkspace>((workspace) => workspace.AnalyzeCode),
                () =>
                {
                    test(
                        "Checking whether diagnostics can be looked up…",
                        async function()
                        {
                            this.timeout(1.5 * 60 * 1000);
                            this.slow(45 * 1000);
                            ok((await tester.AnalyzeCode("let x: sting")).Diagnostics.length > 0);
                        });
                });
        });
}
