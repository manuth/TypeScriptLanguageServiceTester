import Assert = require("assert");
import ts = require("typescript/lib/tsserverlibrary");
import { join } from "upath";
import { TSServer } from "../TSServer";
import { TestConstants } from "./TestConstants";

/**
 * Registers tests for the `TSServer` class.
 */
export function TSServerTests(): void
{
    suite(
        "TSServer",
        () =>
        {
            let tsServer: TSServer;

            setup(
                () =>
                {
                    tsServer = new TSServer(TestConstants.TestWorkspaceDirectory);
                });

            teardown(
                async function()
                {
                    this.timeout(10 * 1000);
                    await tsServer.Dispose();
                });

            suite(
                "General",
                () =>
                {
                    suite(
                        "Logging",
                        () =>
                        {
                            test(
                                "Checking whether the logging can be customized",
                                async () =>
                                {
                                });
                        });
                });

            suite(
                "Disposed",
                () =>
                {
                    test(
                        "Checking whether the value is `false` while the server is running…",
                        () =>
                        {
                            Assert.ok(!tsServer.Disposed);
                        });
                });

            suite(
                "MakePath",
                () =>
                {
                    test(
                        "Checking whether paths are joined correctly…",
                        () =>
                        {
                            let path = ["a", "b", "c"];
                            Assert.strictEqual(tsServer.MakePath(...path), join(tsServer.WorkingDirectory, ...path));
                        });
                });

            suite(
                "Send",
                () =>
                {
                    let file: string;

                    suiteSetup(
                        () =>
                        {
                            file = tsServer.MakePath("index.ts");
                        });

                    test(
                        "Checking whether commands can be executed…",
                        async () =>
                        {
                            await Assert.doesNotReject(
                                async () =>
                                {
                                    return tsServer.Send<ts.server.protocol.OpenRequest>(
                                        {
                                            type: "request",
                                            command: ts.server.protocol.CommandTypes.Open,
                                            arguments: {
                                                file
                                            }
                                        },
                                        false);
                                });
                        });

                    test(
                        "Checking whether commands with with responses can be executed…",
                        async function()
                        {
                            this.timeout(30 * 1000);
                            this.slow(25 * 1000);

                            await Assert.doesNotReject(
                                async () =>
                                {
                                    await tsServer.Send<ts.server.protocol.OpenRequest>(
                                        {
                                            type: "request",
                                            command: ts.server.protocol.CommandTypes.Open,
                                            arguments: {
                                                file
                                            }
                                        },
                                        false);

                                    await tsServer.Send<ts.server.protocol.SemanticDiagnosticsSyncRequest>(
                                        {
                                            type: "request",
                                            command: ts.server.protocol.CommandTypes.SemanticDiagnosticsSync,
                                            arguments: {
                                                file,
                                                includeLinePosition: true
                                            }
                                        },
                                        true);
                                });
                        });

                    test(
                        "Checking whether command-execution is blocked when the server is about to dispose…",
                        async function()
                        {
                            this.timeout(3 * 1000);
                            this.slow(2 * 1000);

                            tsServer.Send<ts.server.protocol.SemanticDiagnosticsSyncRequest>(
                                {
                                    type: "request",
                                    command: ts.server.protocol.CommandTypes.SemanticDiagnosticsSync,
                                    arguments: {
                                        file,
                                        includeLinePosition: true
                                    }
                                },
                                true);

                            tsServer.Dispose();
                            await Assert.rejects(
                                async () => tsServer.Send({ command: "test", type: "request" }, false),
                                /about to/);
                        });

                    test(
                        "Checking whether command-execution is blocked when the server is disposed…",
                        async function()
                        {
                            this.timeout(3 * 1000);
                            this.slow(2 * 1000);
                            await tsServer.Dispose();

                            await Assert.rejects(
                                async () => tsServer.Send({ command: "test", type: "request" }, false));
                        });
                });

            suite(
                "WaitEvent",
                () =>
                {
                    test(
                        "Checking whether events can be awaited…",
                        async function()
                        {
                            this.timeout(4 * 1000);
                            this.slow(3 * 1000);
                            await tsServer.WaitEvent("typingsInstallerPid");
                        });
                });

            suite(
                "Dispose",
                () =>
                {
                    test(
                        "Checking whether the server can be disposed…",
                        async function()
                        {
                            this.timeout(4 * 1000);
                            this.slow(3 * 1000);
                            await Assert.doesNotReject(() => tsServer.Dispose());
                        });

                    test(
                        "Checking whether `Disposed` is true after the disposal…",
                        async function()
                        {
                            this.timeout(5 * 1000);
                            this.slow(4 * 1000);
                            await tsServer.Dispose();
                            Assert.ok(tsServer.Disposed);
                        });
                });
        });
}
