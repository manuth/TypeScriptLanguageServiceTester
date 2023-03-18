import { ChildProcess, fork } from "node:child_process";
import { EventEmitter } from "node:events";
import { createRequire } from "node:module";
import { createInterface, ReadLineOptions } from "node:readline";
import { TempFile } from "@manuth/temp-files";
import { ensureDirSync } from "fs-extra";
import type ts from "typescript/lib/tsserverlibrary.js";
import upath from "upath";

const { dirname, join } = upath;

/**
 * Provides an implementation of the ts-server for testing.
 */
export class TSServer
{
    /**
     * Gets or sets the path to the working directory.
     */
    public WorkingDirectory: string;

    /**
     * The log-file.
     */
    private logFile: TempFile | null = null;

    /**
     * The server-process.
     */
    private serverProcess: ChildProcess;

    /**
     * The current sequence-number.
     */
    private sequenceNumber = 0;

    /**
     * The methods for resolving the requests.
     */
    private requestResolverCollection = new Map<number, (response: ts.server.protocol.Response) => void>();

    /**
     * A component for emitting events.
     */
    private eventEmitter = new EventEmitter();

    /**
     * A value indicating whether a disposal is requested.
     */
    private disposalRequested = false;

    /**
     * A value indicating whether the server is disposed.
     */
    private disposed = false;

    /**
     * A promise that resolves as soon as the server exits.
     */
    private exitPromise: Promise<number>;

    /**
     * Initializes a new instance of the {@link TSServer `TSServer`} class.
     *
     * @param workingDirectory
     * The directory to open.
     */
    public constructor(workingDirectory: string)
    {
        this.WorkingDirectory = workingDirectory;

        if (this.LogLevel)
        {
            ensureDirSync(dirname(this.LogFileName));
        }

        this.serverProcess = fork(
            this.TypeScriptServerPath,
            (
                this.LogLevel ?
                    [
                        "--logVerbosity",
                        this.LogLevel,
                        "--logFile",
                        this.LogFileName
                    ] :
                    []
            ),
            {
                cwd: this.WorkingDirectory,
                stdio: ["pipe", "pipe", "pipe", "ipc"]
            });

        this.exitPromise = new Promise(
            (resolve, reject) =>
            {
                this.serverProcess.on(
                    "exit",
                    (code) =>
                    {
                        resolve(code ?? 0);
                    });

                this.serverProcess.on(
                    "error",
                    (error) =>
                    {
                        reject(error);
                    });
            });

        this.serverProcess.stdout?.setEncoding("utf-8");

        createInterface(
            {
                input: this.serverProcess.stdout,
                output: this.serverProcess.stdin
            } as ReadLineOptions).on(
                "line",
                (input) =>
                {
                    if (!input.startsWith("{"))
                    {
                        return;
                    }
                    else
                    {
                        try
                        {
                            let result = JSON.parse(input) as ts.server.protocol.Message;

                            switch (result.type)
                            {
                                case "response":
                                    let response = result as ts.server.protocol.Response;

                                    if (this.requestResolverCollection.has(response.request_seq))
                                    {
                                        let resolver = this.requestResolverCollection.get(response.request_seq);
                                        this.requestResolverCollection.delete(response.request_seq);
                                        resolver?.(response);

                                        if (this.disposalRequested && (this.requestResolverCollection.size === 0))
                                        {
                                            this.Dispose();
                                        }
                                    }
                                    break;
                                case "event":
                                    let event = result as ts.server.protocol.Event;
                                    this.eventEmitter.emit(event.event, event);
                                    break;
                            }
                        }
                        catch
                        { }
                    }
                });
    }

    /**
     * Gets the path to the typescript-server.
     */
    public get TypeScriptServerPath(): string
    {
        return createRequire(this.MakePath(".js")).resolve(this.TypeScriptServerPackageName);
    }

    /**
     * Gets the path to the typescript-library.
     */
    public get TypeScriptLibraryPath(): string
    {
        return createRequire(this.MakePath(".js")).resolve(this.TypeScriptLibraryPackageName);
    }

    /**
     * Gets the typescript-server library.
     */
    public get TSServerLibrary(): typeof ts
    {
        return createRequire(import.meta.url)(this.TypeScriptLibraryPackageName);
    }

    /**
     * Gets the verbosity of the log.
     */
    public get LogLevel(): keyof typeof ts.server.LogLevel | undefined
    {
        let logLevel = this.TSServerLibrary.server.LogLevel;
        return logLevel[logLevel.verbose] as keyof typeof ts.server.LogLevel;
    }

    /**
     * Gets the name of the log-file.
     */
    public get LogFileName(): string
    {
        if (this.logFile === null)
        {
            this.logFile = new TempFile(
                {
                    Suffix: ".log"
                });
        }

        return this.logFile.FullName;
    }

    /**
     * Gets a value indicating whether the server is disposed.
     */
    public get Disposed(): boolean
    {
        return this.disposed;
    }

    /**
     * Gets the name of the `typescript`-package.
     */
    protected get TypeScriptPackageName(): string
    {
        return "typescript";
    }

    /**
     * Gets the name of the `tsserver`-package.
     */
    protected get TypeScriptServerPackageName(): string
    {
        return join(this.TypeScriptPackageName, "lib", "tsserver");
    }

    /**
     * Gets the name of the `tsserverlibrary`-package.
     */
    protected get TypeScriptLibraryPackageName(): string
    {
        return join(this.TypeScriptPackageName, "lib", "tsserverlibrary");
    }

    /**
     * Creates a path relative to the working-directory.
     *
     * @param path
     * The path to join.
     *
     * @returns
     * The joined path.
     */
    public MakePath(...path: string[]): string
    {
        return join(this.WorkingDirectory, ...path);
    }

    /**
     * Sends a request to the server.
     *
     * @template T
     * The type of the request.
     *
     * @param request
     * The request to send.
     *
     * @param responseExpected
     * A value indicating whether an answer is expected.
     *
     * @returns
     * The response of the server.
     */
    public Send<T extends ts.server.protocol.Request>(request: Omit<T, "seq"> & Partial<T>, responseExpected?: false): Promise<void>;

    /**
     * Sends a request to the server.
     *
     * @template T
     * The type of the request.
     *
     * @param request
     * The request to send.
     *
     * @param responseExpected
     * A value indicating whether an answer is expected.
     *
     * @returns
     * The response of the server.
     */
    public Send<T extends ts.server.protocol.Request>(request: Omit<T, "seq"> & Partial<T>, responseExpected: true): Promise<ts.server.protocol.Response>;

    /**
     * Sends a request to the server.
     *
     * @template T
     * The type of the request.
     *
     * @param request
     * The request to send.
     *
     * @param responseExpected
     * A value indicating whether an answer is expected.
     *
     * @returns
     * The response of the server.
     */
    public async Send<T extends ts.server.protocol.Request>(request: Omit<T, "seq"> & Partial<T>, responseExpected?: boolean): Promise<ts.server.protocol.Response | void>
    {
        let realRequest: T = request as T;
        realRequest.seq = request.seq ?? this.sequenceNumber++;

        if (this.Disposed)
        {
            throw new Error("The server is disposed!");
        }
        else if (this.disposalRequested)
        {
            throw new Error("The server is about to be disposed!");
        }
        else
        {
            let result = new Promise<ts.server.protocol.Response | void>(
                (resolve) =>
                {
                    if (responseExpected)
                    {
                        this.requestResolverCollection.set(
                            realRequest.seq,
                            (response) =>
                            {
                                resolve(response);
                            });
                    }
                    else
                    {
                        resolve();
                    }
                });

            this.serverProcess.stdin?.write(`${JSON.stringify(request)}\n`);
            return result;
        }
    }

    /**
     * Waits for the specified event.
     *
     * @param eventName
     * The event to wait for.
     *
     * @returns
     * The emitted event.
     */
    public async WaitEvent(eventName: string): Promise<ts.server.Event>
    {
        return new Promise(
            (resolve) =>
            {
                this.eventEmitter.once(eventName, (event) => resolve(event));
            });
    }

    /**
     * Disposes the server.
     *
     * @returns
     * The exit-code of the server.
     */
    public async Dispose(): Promise<number>
    {
        if (!this.disposed && !this.disposalRequested)
        {
            this.Send<ts.server.protocol.ExitRequest>(
                {
                    type: "request",
                    command: this.TSServerLibrary.server.protocol.CommandTypes.Exit
                },
                false);
        }

        this.disposalRequested = true;

        if (this.requestResolverCollection.size === 0)
        {
            this.serverProcess.stdin?.end();
            this.logFile?.Dispose();
            this.logFile = null;
            this.disposed = true;
            this.disposalRequested = false;
        }

        return this.exitPromise;
    }
}
