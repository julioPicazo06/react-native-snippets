# Changelog

All notable changes to `React Native Snippet Lab` will be documented in this file.

The format is based on Keep a Changelog, and this project follows Semantic Versioning for release tags.

## [Unreleased]

### Added

- bilingual documentation structure with `README.md` and `README.es.md`
- `TESTING.md` as the manual QA baseline for release validation
- smart JSX snippets for common React Native UI building blocks
- smart style rule creation inside `StyleSheet.create`
- contextual style aliases and value aliases
- automatic handler creation for snippet flows such as `rnpress`
- TypeScript object typing actions and type sync options
- React Native import correction helpers
- list and UI state snippets including `rnempty`, `rnloading`, `rnerror`, `rnrefresh`, and `rnlistempty`
- clearer `rnlistitem` alias for the legacy `rnitem` behavior

### Changed

- `rnfocus` now inserts a more useful `useFocusEffect` refetch and cleanup pattern
- `rnlistempty` now creates `ListEmptyComponent={renderListEmpty}` plus a helper instead of inserting a large inline JSX block
- `rnpress` now selects its primary style rule after insertion and creates `handlePress` automatically when needed
- generated handlers now keep a blank line before the JSX `return` block for readability
- smart JSX snippets only appear inside component contexts

### Fixed

- duplicate snippet visibility between JS and TS component variants
- malformed smart snippet insertion that could leave prefix fragments behind
- incorrect or conflicting import placement for React Native symbols
- stylesheet helper flows that left invalid empty rule names or awkward formatting

## [0.0.1] - Initial local MVP

### Added

- initial extension scaffold
- first pass of React Native snippets
- style alias autocomplete
