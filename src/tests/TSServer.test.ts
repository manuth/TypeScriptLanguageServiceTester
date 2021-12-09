import { doesNotReject, ok, rejects, strictEqual } from "assert";
import { TempFile } from "@manuth/temp-files";
import { readFile } from "fs-extra";
import { server } from "typescript/lib/tsserverlibrary";
import { join } from "upath";
import { TSServer } from "../TSServer";
import { TestConstants } from "./TestConstants";

/**
 * Registers tests for the {@link TSServer `TSServer`} class.
 */
export function TSServerTests(): void
{
    suite(
        nameof(TSServer),
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
                            let customLogFile: TempFile;
                            let logDisabled: TSServer;
                            let logEnabled: TSServer;

                            suiteSetup(
                                () =>
                                {
                                    customLogFile = new TempFile();
                                });

                            suiteTeardown(
                                () =>
                                {
                                    customLogFile.Dispose();
                                });

                            setup(
                                () =>
                                {
                                    logDisabled = new class extends TSServer
                                    {
                                        /**
                                         * @inheritdoc
                                         */
                                        public override get LogLevel(): keyof typeof server.LogLevel
                                        {
                                            return null;
                                        }
                                    }(TestConstants.TestWorkspaceDirectory);

                                    logEnabled = new class extends TSServer
                                    {
                                        /**
                                         * @inheritdoc
                                         */
                                        public override get LogLevel(): keyof typeof server.LogLevel
                                        {
                                            return server.LogLevel[server.LogLevel.verbose] as keyof typeof server.LogLevel;
                                        }

                                        /**
                                         * @inheritdoc
                                         */
                                        public override get LogFileName(): string
                                        {
                                            return customLogFile.FullName;
                                        }
                                    }(TestConstants.TestWorkspaceDirectory);
                                });

                            teardown(
                                async function()
                                {
                                    this.timeout(10 * 1000);
                                    await logDisabled.Dispose();
                                    await logEnabled.Dispose();
                                });

                            test(
                                "Checking whether the logging can be customized…",
                                async function()
                                {
                                    this.timeout(4 * 1000);
                                    this.slow(3 * 1000);
                                    let event = TestConstants.TestEvent;

                                    await Promise.all(
                                        [
                                            logDisabled.WaitEvent(event),
                                            logEnabled.WaitEvent(event)
                                        ]);

                                    strictEqual((await readFile(logDisabled.LogFileName)).toString().length, 0);
                                    ok((await readFile(logEnabled.LogFileName)).toString().length > 0);
                                });
                        });
                });

            suite(
                nameof<TSServer>((server) => server.Disposed),
                () =>
                {
                    test(
                        `Checking whether the value is \`${false}\` while the server is running…`,
                        () =>
                        {
                            ok(!tsServer.Disposed);
                        });
                });

            suite(
                nameof<TSServer>((server) => server.MakePath),
                () =>
                {
                    test(
                        "Checking whether paths are joined correctly…",
                        () =>
                        {
                            let path = ["a", "b", "c"];
                            strictEqual(tsServer.MakePath(...path), join(tsServer.WorkingDirectory, ...path));
                        });
                });

            suite(
                nameof<TSServer>((server) => server.Send),
                () =>
                {
                    let file: string;

                    setup(
                        () =>
                        {
                            file = tsServer.MakePath("index.ts");
                        });

                    test(
                        "Checking whether commands can be executed…",
                        async () =>
                        {
                            await doesNotReject(
                                async () =>
                                {
                                    return tsServer.Send<server.protocol.OpenRequest>(
                                        {
                                            type: "request",
                                            command: server.protocol.CommandTypes.Open,
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

                            await doesNotReject(
                                async () =>
                                {
                                    await tsServer.Send<server.protocol.OpenRequest>(
                                        {
                                            type: "request",
                                            command: server.protocol.CommandTypes.Open,
                                            arguments: {
                                                file
                                            }
                                        },
                                        false);

                                    await tsServer.Send<server.protocol.SemanticDiagnosticsSyncRequest>(
                                        {
                                            type: "request",
                                            command: server.protocol.CommandTypes.SemanticDiagnosticsSync,
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

                            tsServer.Send<server.protocol.SemanticDiagnosticsSyncRequest>(
                                {
                                    type: "request",
                                    command: server.protocol.CommandTypes.SemanticDiagnosticsSync,
                                    arguments: {
                                        file,
                                        includeLinePosition: true
                                    }
                                },
                                true);

                            tsServer.Dispose();

                            await rejects(
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

                            await rejects(
                                async () => tsServer.Send({ command: "test", type: "request" }, false));
                        });
                });

            suite(
                nameof<TSServer>((server) => server.WaitEvent),
                () =>
                {
                    test(
                        "Checking whether events can be awaited…",
                        async function()
                        {
                            this.timeout(4 * 1000);
                            this.slow(3 * 1000);
                            await tsServer.WaitEvent(TestConstants.TestEvent);
                        });
                });

            suite(
                nameof<TSServer>((server) => server.Dispose),
                () =>
                {
                    test(
                        "Checking whether the server can be disposed…",
                        async function()
                        {
                            this.timeout(4 * 1000);
                            this.slow(3 * 1000);
                            await doesNotReject(() => tsServer.Dispose());
                        });

                    test(
                        `Checking whether \`${nameof<TSServer>((server) => server.Disposed)}\` is true after the disposal…`,
                        async function()
                        {
                            this.timeout(5 * 1000);
                            this.slow(4 * 1000);
                            await tsServer.Dispose();
                            ok(tsServer.Disposed);
                        });
                });
        });
}
