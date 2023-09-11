# THIS PROJECT IS MOVING
This project is moving to [Codeberg.org](https://codeberg.org).

If you wish to check out the most recent source code, file an issue or contribute to this project, please head to the [new repository on Codeberg.org](https://codeberg.org/lordgizmo/TypeScriptLanguageServiceTester):

<https://codeberg.org/lordgizmo/TypeScriptLanguageServiceTester>

# TypeScriptLanguageServiceTester
Provides components for testing the typescript language-server and language-services.

[![status-badge](https://ci.nuth.ch/api/badges/manuth/TypeScriptLanguageServiceTester/status.svg)](https://ci.nuth.ch/manuth/TypeScriptLanguageServiceTester)

## Installing the package
This package can be added to your dependencies by invoking:

```bash
npm i -D @manuth/typescript-languageservice-tester
```

## `LanguageServiceTester`
The `LanguageServiceTester` allows you to analyze code for ensuring all expected diagnostics are being delivered.

A `LanguageServiceTester` can be initialized by passing a directory to run the `tsserver` in:

```ts
import { LanguageServiceTester } from "@manuth/typescript-languageservice-tester";

let tester = new LanguageServiceTester("/tmp/test-workspace");
```

### Installing dependencies
If `typescript` is not installed in your workspace, you can install it using the `LanguageServiceTester.Install` method:

```ts
await tester.Install();
```

### Live-Updating Plugins
You can perform a live-update of plugin-configurations by invoking the `LanguageServiceTester.ConfigurePlugin` by passing the plugin-name and the configuration to apply at runtime:

```ts
await tester.ConfigurePlugin("typescript-eslint-language-service", { watchDirs: "." });
```

### Analyzing Diagnostics
The `LanguageServiceTester.AnalyzeCode`-method allows you to analyze a code and getting all diagnostics for the specified code.

You can optionally pass a script-kind (such as `TS`, `JSX` etc.) and a file-name to be used. Otherwise the code is assumed to be `TS` and a generic file-name is used.

```ts
import { writeFile } from "fs-extra";

await writeFile(
    tester.MakePath("tsconfig.json"),
    {
        compilerOptions: {
            plugins: [
                {
                    name: "typescript-eslint-language-service"
                }
            ]
        }
    });

let diagnosticResponse = await AnalyzeCode("let x;;;");
```

### Getting Code-Fixes
You can then either get all code-fixes for the analyzed code or code-fixes for a specific diagnostic:

```ts
await diagnosticResponse.GetCodeFixes();
await diagnosticResponse.Diagnostics[0].GetCodeFixes();
```

## Running and controlling a `TSServer`
You can run an instance of `typescript/lib/tsserver` by creating a new instance of the `TSServer`-class.
The `TSServer` class allows you to communicate with the `tsserver` by sending requests and awaiting answers or events:

```ts
let tsServer = new TSServer("/tmp/test-workspace");
```

### Sending Requests
The `TSServer.Send`-method allows you to send requests to the `tsserver` easily:

```ts
import { server } from "typescript/lib/tsserverlibrary";

await tsServer.Send(
    {
        type: "request",
        command: server.protocol.CommandTypes.ReloadProjects
    },
    false);
```

The second argument allows you to specify whether a response is expected.

Some requests such as the `SemanticDiagnosticsSyncRequest` return a response. In that case you can pass `true` as the second argument which will cause the `Send`-method to resolve with the `Response` to the request.

```ts
import { join } from "upath";
import { server } from "typescript/lib/tsserverlibrary";

let response = await tsServer.Send<server.protocol.SemanticDiagnosticsSyncRequest>(
    {
        type: "request",
        command: server.protocol.CommandTypes.SemanticDiagnosticsSync,
        arguments: {
            file: "/tmp/test-workspace/example.js",
            includeLinePosition: false
        }
    });

console.log(response.body); // Logs the diagnostics which have been found
```

### Waiting for Events
The `WaitEvent` method allows you to wait for an event to be emitted:

```ts
await tsServer.WaitEvent("typingsInstallerPid");
```

### Disposing the `TSServer`
By disposing the `TSServer`, the underlying `tsserver`-process is closed by sending an `ExitRequest` and closing the `stdin`-stream.

```ts
await tsServer.Dispose();
```

## Working with `Workspaces`
In some cases you might want to analyze code from a different workspace-folder to see how `typescript` is acting if files from a foreign project are being opened.

You can test the behaviour by creating temporary workspaces. Workspaces provide the same features like the `LanguageServiceTester`.

```ts
let workspace = await tester.CreateTemporaryWorkspace();
await workspace.Install();
await workspace.AnalyzeCode("let x;;;", "JSX");
```
