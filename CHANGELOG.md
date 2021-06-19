# Changelog
All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## TypeScriptLanguageServiceTester [Unreleased]

[Show differences](https://github.com/manuth/TypeScriptLanguageServiceTester/compare/v2.0.0...dev)

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
