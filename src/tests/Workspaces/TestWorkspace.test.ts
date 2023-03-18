import { ok, strictEqual } from "node:assert";
import { Package } from "@manuth/package-json-editor";
import { TempFile } from "@manuth/temp-files";
import fs from "fs-extra";
import RandExp from "randexp";
import { Project, SourceFile } from "ts-morph";
import { fileName } from "types-tsconfig";
import { Diagnostic } from "../../Diagnostics/Diagnostic.js";
import { TestWorkspace } from "../../Workspaces/TestWorkspace.js";
import { ITestContext } from "../ITestContext.js";
import { TestLanguageServiceTester } from "../TestLanguageServiceTester.js";

const { move, pathExists, remove, writeJSON } = fs;
const { randexp } = RandExp;

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
            let workspaceContainer: TestWorkspace;
            let workspace: TestWorkspace;

            suiteSetup(
                async () =>
                {
                    tester = new TestLanguageServiceTester();
                    workspaceContainer = await tester.CreateTemporaryWorkspace();
                });

            suiteTeardown(
                async () =>
                {
                    await workspaceContainer.Dispose();
                    await tester.Dispose();
                });

            setup(
                async () =>
                {
                    workspace = new TestWorkspace(tester, workspaceContainer.WorkspacePath);
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
                    let typeScriptPackageName = "typescript";
                    let versionNumber: string;
                    let packageFileName: string;
                    let packageFileBaseName = Package.FileName;
                    let tempPackageFileName: string;

                    suiteSetup(
                        async () =>
                        {
                            versionNumber = randexp(/\d+\.\d+\.\d+/);
                            packageFileName = workspaceContainer.MakePath(packageFileBaseName);
                            tempPackageFileName = workspaceContainer.MakePath(`_${packageFileBaseName}`);

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
                        `Checking whether a \`${packageFileBaseName}\`-file containing \`${typeScriptPackageName}\` is created if it doesn't exist…`,
                        async function()
                        {
                            this.slow(25 * 1000);
                            this.timeout(50 * 1000);
                            ok(!(await pathExists(packageFileName)));
                            await workspace.Install();
                            ok(await pathExists(packageFileName));
                            ok(new Package(packageFileName).AllDependencies.Has(typeScriptPackageName));
                        });

                    test(
                        `Checking whether \`${typeScriptPackageName}\` is added to existing \`${packageFileBaseName}\`-files if it isn't present…`,
                        async function()
                        {
                            this.slow(25 * 1000);
                            this.timeout(50 * 1000);
                            let npmPackage = new Package();
                            npmPackage.FileName = packageFileName;
                            await writeJSON(npmPackage.FileName, npmPackage.ToJSON());
                            ok(!new Package(npmPackage.FileName).AllDependencies.Has(typeScriptPackageName));
                            await workspace.Install();
                            ok(new Package(npmPackage.FileName).AllDependencies.Has(typeScriptPackageName));
                        });

                    test(
                        `Checking whether the \`${typeScriptPackageName}\`-dependency version is left untouched if it already exists in the \`${packageFileBaseName}\`-file…`,
                        async function()
                        {
                            this.slow(25 * 1000);
                            this.timeout(50 * 1000);
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
                nameof<TestWorkspace>((workspace) => workspace.Configure),
                () =>
                {
                    let tempFile: TempFile;
                    let file: SourceFile;

                    setup(
                        () =>
                        {
                            tempFile = new TempFile(
                                {
                                    Suffix: ".ts"
                                });

                            file = new Project().createSourceFile(
                                tempFile.FullName,
                                undefined,
                                {
                                    overwrite: true
                                });
                        });

                    teardown(
                        () =>
                        {
                            tempFile.Dispose();
                        });

                    test(
                        `Checking whether the options of the \`${fileName}\`-file can be modified…`,
                        async function()
                        {
                            this.timeout(15 * 1000);
                            this.slow(7.5 * 1000);

                            /**
                             * Filters all diagnostics which are related to the {@link CompilerOptions.noImplicitAny `noImplicitAny`}-option.
                             *
                             * @param diagnostics
                             * The diagnostics to filter.
                             *
                             * @returns
                             * The diagnostics which are related to the {@link CompilerOptions.noImplicitAny `noImplicitAny`}-option.
                             */
                            function FilterNoImplicitAny(diagnostics: Diagnostic[]): Diagnostic[]
                            {
                                return diagnostics.filter(
                                    (diagnostic) =>
                                    {
                                        return diagnostic.Code === 7006;
                                    });
                            }

                            file.addFunction(
                                {
                                    name: "test",
                                    parameters: [
                                        {
                                            name: "test"
                                        }
                                    ]
                                });

                            for (let noImplicitAny of [true, false])
                            {
                                await workspace.Configure(
                                    {
                                        compilerOptions: {
                                            noImplicitAny
                                        }
                                    });

                                strictEqual(FilterNoImplicitAny((await workspace.AnalyzeCode(file.print())).Diagnostics).length, noImplicitAny ? 1 : 0);
                            }
                        });
                });

            suite(
                nameof<TestWorkspace>((workspace) => workspace.AnalyzeCode),
                () =>
                {
                    let tempFile: TempFile;
                    let file: SourceFile;

                    setup(
                        () =>
                        {
                            tempFile = new TempFile(
                                {
                                    Suffix: ".ts"
                                });

                            file = new Project().createSourceFile(
                                tempFile.FullName,
                                undefined,
                                {
                                    overwrite: true
                                });
                        });

                    teardown(
                        () =>
                        {
                            tempFile.Dispose();
                        });

                    test(
                        "Checking whether semantic diagnostics can be looked up…",
                        async function()
                        {
                            this.timeout(1.5 * 60 * 1000);
                            this.slow(45 * 1000);

                            await workspace.Configure(
                                {
                                    compilerOptions: {
                                        noImplicitAny: true
                                    }
                                });

                            file.addFunction(
                                {
                                    name: "test",
                                    parameters: [
                                        {
                                            name: "test"
                                        }
                                    ]
                                });

                            let result = (await workspace.AnalyzeCode(file.print())).CodeAnalysisResult;
                            ok(result.SemanticDiagnosticsResponse.body);
                            ok(result.SemanticDiagnosticsResponse.body.length > 0);
                        });

                    test(
                        "Checking whether syntactic diagnostics can be looked up…",
                        async function()
                        {
                            this.timeout(2 * 1000);
                            this.slow(1 * 1000);
                            let result = (await workspace.AnalyzeCode("let<> x = 1;")).CodeAnalysisResult;
                            ok(result.SyntacticDiagnosticsResponse.body);
                            ok(result.SyntacticDiagnosticsResponse.body.length > 0);
                        });
                });
        });
}
