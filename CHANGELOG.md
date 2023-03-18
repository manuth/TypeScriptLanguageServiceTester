# Changelog
All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## TypeScriptLanguageServiceTester [Unreleased]
### Updated
  - All dependencies
  - `TSServer` to not reload the project after opening a file
  - Development environment to migrate from Drone CI to Woodpecker CI

### Removed
  - Dependabot

[Show differences](https://github.com/manuth/TypeScriptLanguageServiceTester/compare/v5.0.0...dev)

## TypeScriptLanguageServiceTester v5.0.0
### Breaking
  - Update the package to an ESModule

[Show differences](https://github.com/manuth/TypeScriptLanguageServiceTester/compare/v4.0.5...v5.0.0)

## TypeScriptLanguageServiceTester v4.0.5
### Updated
  - All dependencies
  - Drone pipeline in order to prevent inconsistent changelogs

### Fixed
  - Vulnerabilities in dependencies

[Show differences](https://github.com/manuth/TypeScriptLanguageServiceTester/compare/v4.0.4...v4.0.5)

## TypeScriptLanguageServiceTester v4.0.4
### Updated
  - All dependencies
  - Linting environment
  - Tests by using the `typescript-tslint-plugin` as an example
  - Test-timeouts

### Fixed
  - Vulnerabilities in dependencies
  - Incorrect drone pipelines
  - Broken tests

[Show differences](https://github.com/manuth/TypeScriptLanguageServiceTester/compare/v4.0.3...v4.0.4)

## TypeScriptLanguageServiceTester v4.0.3
### Fixed
  - All vulnerabilities in dependencies

### Updated
  - All dependencies
  - Release-scripts in drone-pipelines
  - Settings to disable time-outs during mocha unit-tests

[Show differences](https://github.com/manuth/TypeScriptLanguageServiceTester/compare/v4.0.2...v4.0.3)

## TypeScriptLanguageServiceTester v4.0.2
### Added
  - Missing export-statement

### Updated
  - All dependencies

[Show differences](https://github.com/manuth/TypeScriptLanguageServiceTester/compare/v4.0.1...v4.0.2)

## TypeScriptLanguageServiceTester v4.0.1
### Fixed
  - Unit-Test timeouts

[Show differences](https://github.com/manuth/TypeScriptLanguageServiceTester/compare/v4.0.0...v4.0.1)

## TypeScriptLanguageServiceTester v4.0.0
### Breaking
  - Include syntactic diagnostics in the `TestWorkspace.AnalyzeCode`-result

### Added
  - Support to instantiate `LanguageServiceTester`s without creating an own class
  - Support for updating `tsconfig`-settings of `TestWorkspace`s

### Updated
  - All dependencies

[Show differences](https://github.com/manuth/TypeScriptLanguageServiceTester/compare/v3.0.1...v4.0.0)

## TypeScriptLanguageServiceTester v3.0.1
### Fixed
  - `ts-patch`-installation by adding `ts-node` to `devDependencies`

### Updated
  - All dependencies

[Show differences](https://github.com/manuth/TypeScriptLanguageServiceTester/compare/v3.0.0...v3.0.1)

## TypeScriptLanguageServiceTester v3.0.0
### Breaking
  - Fixed spelling errors

### Fixed
  - Spelling errors
  - Broken `package-json`-script

### Added
  - Support for the Test Explorer UI

### Updated
  - The `README`-file
  - All dependencies

[Show differences](https://github.com/manuth/TypeScriptLanguageServiceTester/compare/v2.0.1...v3.0.0)

## TypeScriptLanguageServiceTester v2.0.1
### Removed
  - All calls to `typescript/lib/tsserverlibrary` and replaced the with the module located in the working-directory provided by the user

### Added
  - `typescript` to the normal `dependencies` to provide type-declarations correctly

### Updated
  - All dependencies

[Show differences](https://github.com/manuth/TypeScriptLanguageServiceTester/compare/v2.0.0...v2.0.1)

## TypeScriptLanguageServiceTester v2.0.0
### Fixed
  - Broken drone-pipelines
  - Drone-pipelines for multi-digit version-numbers
  - Broken dependabot-settings
  - Vulnerabilities in dependencies

### Added
  - A workflow for analyzing the source-code
  - A workflow for automatically merging dependabot-PRs

### Updated
  - Drone-pipeline to use smaller images
  - The `TestWorkspace`-class to not tamper with existing `package.json`-files too much
  - All dependencies

[Show differences](https://github.com/manuth/TypeScriptLanguageServiceTester/compare/v1.0.2...v2.0.0)

## TypeScriptLanguageServiceTester v1.0.2
### Updated
  - All dependencies

[Show differences](https://github.com/manuth/TypeScriptLanguageServiceTester/compare/v1.0.1...v1.0.2)

## TypeScriptLanguageServiceTester v1.0.1
### Added
  - Missing exports

[Show differences](https://github.com/manuth/TypeScriptLanguageServiceTester/compare/v1.0.0...v1.0.1)

## TypeScriptLanguageServiceTester v1.0.0
  - Initial release

### Added
  - Components for testing a typescript languageservice plugin
  - Components for running and controlling a `tsserver`-instance
  - Components for analyzing code-actions and diagnostics
  - Components for representing workspaces

[Show differences](https://github.com/manuth/TypeScriptLanguageServiceTester/compare/c0889d1f557682b8435ce19467fcf16ef78be45c...v1.0.0)
