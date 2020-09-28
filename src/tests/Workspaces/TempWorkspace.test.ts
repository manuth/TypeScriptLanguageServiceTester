import Assert = require("assert");
import { pathExists } from "fs-extra";
import { TempWorkspace } from "../../Workspaces/TempWorkspace";
import { TestLanguageServiceTester } from "../TestLanguageServiceTester";

/**
 * Registers tests for the `TempWorkspace` class.
 */
export function TempWorkspaceTests(): void
{
    suite(
        "TempWorkspace",
        () =>
        {
            let tester: TestLanguageServiceTester;
            let workspace: TempWorkspace;

            suiteSetup(
                () =>
                {
                    tester = new TestLanguageServiceTester();
                });

            setup(
                () =>
                {
                    workspace = new TempWorkspace(tester);
                });

            teardown(
                async () =>
                {
                    try
                    {
                        await workspace.Dispose();
                    }
                    catch { }
                });

            suite(
                "Dispose",
                () =>
                {
                    test(
                        "Checking whether temporary workspaces are deleted on disposal…",
                        async () =>
                        {
                            Assert.ok(await pathExists(workspace.WorkspacePath));
                            await workspace.Dispose();
                            Assert.ok(!await pathExists(workspace.WorkspacePath));
                        });
                });
        });
}
