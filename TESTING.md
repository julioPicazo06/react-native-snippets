# Testing Guide

This document defines the manual QA baseline for `React Native Snippet Lab` before a release candidate or public Marketplace publication.

## Release Gate

Treat these checks as release-critical:

- smart snippets insert the expected JSX
- missing imports are added from the correct module
- `StyleSheet.create` rules are created in the right place
- style aliases only appear in style contexts
- `styles.something` references stay linked to the stylesheet rule
- handlers such as `handlePress` are created when the snippet expects them
- TypeScript-only behavior works in `ts` and `tsx`
- no snippet duplicates appear in completion lists for JS or TS

Do not mark a release ready if any blocking case below fails.

## Recommended Test Environments

Run the manual checks in:

- Visual Studio Code stable
- Cursor, if it is part of the expected user audience

Recommended file types:

- `javascriptreact`
- `typescriptreact`
- `typescript`

## Pre-Flight

Before interactive testing:

1. Run `npm run check`
2. Open the extension project in VS Code
3. Press `F5` to launch an `Extension Development Host`
4. In the host window, create a scratch workspace or sample React Native file set

## Core Smoke Test

Create a file named `SmokeScreen.tsx` and verify:

1. `rnconst` creates a component using the file name as the default component name
2. `rnsafe` inserts `SafeAreaView` and creates `styles.safeArea`
3. `rnscroll` inserts `contentContainerStyle={styles.content}`
4. `rnview` inserts a `View` with a generated style rule
5. `rnpress` inserts a `Pressable`, creates both style rules, and creates `handlePress` if missing

Expected result:

- imports are correct
- no duplicate stylesheet keys are introduced
- the main style name is selected after snippet insertion

## Snippet Completion Coverage

Verify that these prefixes appear only once per relevant language context:

### Shared snippets

- `rnfc`
- `rnscreen`
- `rnview`
- `rntext`
- `rnpress`
- `rninput`
- `rnscroll`
- `rnsafe`
- `rnimage`
- `rnmodal`
- `rnstyle`
- `rnstate`
- `rneffect`
- `rnref`
- `rnhook`
- `rndim`
- `rnappstate`
- `rnfocus`
- `rnstack`
- `rntabs`
- `rnnav`
- `rnnavto`
- `rnroute`
- `rnform`
- `rncontroller`
- `rnflat`
- `rnsearchlist`
- `rnsection`
- `rnitem`
- `rnlistitem`
- `rnempty`
- `rnloading`
- `rnerror`
- `rnskeleton`
- `rnlistheader`
- `rnsearchheader`
- `rnsectionheader`
- `rnlistempty`
- `rnrefresh`

### JS-only snippets

- `rnconst`
- `rnexportconst`

Expected in `jsx`:

- only JS component variants should appear

### TS-only snippets

- `rnconst`
- `rnexportconst`
- `rnts`

Expected in `tsx`:

- only TS component variants should appear
- TS snippets should include the props type scaffold

## Smart Style Rule Creation

Create a `tsx` file with a simple component and verify:

1. inserting `rnview` creates a style rule and uses `styles.container` or a unique variant
2. inserting a second `rnview` does not overwrite the first rule
3. renaming the selected style name updates both JSX and stylesheet key
4. deleting the snippet reference does not leave malformed empty rule names

Expected result:

- no dangling `: {},`
- no `styles.`
- no accidental overwrite of an existing rule

## `styles.something` Reference Flow

Inside these props, test typing a raw identifier and accepting the suggestion:

- `style={card}`
- `style={[styles.base, card]}`
- `contentContainerStyle={content}`
- `headerStyle={header}`
- `iconStyle={icon}`

Expected result:

- identifier becomes `styles.<ruleName>`
- missing rule is created
- if no stylesheet exists, one is created
- `StyleSheet` is added to the correct import

## Style Alias Coverage

Inside `StyleSheet.create({})`, verify property aliases:

- `bg`
- `c`
- `px`
- `py`
- `ai`
- `jc`
- `fd`
- `br`

Verify value aliases:

- `ai-c`
- `fd-r`
- `jc-sb`
- `pos-a`
- `ov-h`

Expected result:

- aliases appear only in style contexts
- aliases do not appear in plain JSX text, handler positions, or value expressions

## Import Correction Cases

Use a file with intentionally broken imports and verify `Add Missing React Native Imports`.

Test cases:

1. `SafeAreaView` missing entirely
2. `Pressable` missing entirely
3. `Text` and `View` missing entirely
4. `Pressable` or `Text` incorrectly imported from another module
5. mixed import file with both navigation and `react-native`

Expected result:

- `SafeAreaView` comes from `react-native-safe-area-context`
- React Native core components come from `react-native`
- symbols imported from the wrong module are moved to the canonical source
- conflicting imports are not left behind

## Inline Style Extraction

Verify extraction for:

- `style={{ padding: 16 }}`
- `contentContainerStyle={{ paddingBottom: 24 }}`
- `headerStyle={{ backgroundColor: '#111' }}`

Expected result:

- inline object becomes `styles.<ruleName>`
- the rule is added to `StyleSheet.create`
- import for `StyleSheet` is added when needed

Known current limitation:

- array expressions such as `style={[base, { padding: 16 }]}` are not considered release blockers unless the feature claims support for them

## Handler Creation

Verify contextual handler creation in JSX props:

- `onPress={handlePress}`
- `onChangeText={handleChange}`
- `renderItem={renderItem}`
- `keyExtractor={keyExtractor}`
- `renderSectionHeader={renderSectionHeader}`

Expected result:

- missing helpers are created before the component `return`
- missing helpers keep a blank line between the helper block and the JSX `return`
- helpers are not duplicated if already present
- generated signatures match the prop type heuristic

For `rnpress`, verify specifically:

- inserting the snippet creates `handlePress` automatically when it does not exist
- inserting another `rnpress` in the same component does not duplicate `handlePress`

## TypeScript Object Typing

In a `tsx` file, verify `Tipar Objeto` and type actions with:

```tsx
const transactions = [
  {
    id: '1',
    title: 'Payroll',
    type: 'income',
  },
];
```

Expected result:

- context menu action creates a type alias
- the const gets annotated correctly
- typed arrays use `TypeName[]`
- existing type aliases can be filled instead of duplicated

Also verify:

- `const item: Transaction = { ... }`
- `const items: Transaction[] = [ ... ]`
- `type Transaction = {}` plus quick fix

## Navigation Snippets

Verify:

- `rnstack`
- `rntabs`
- `rnnav`
- `rnnavto`
- `rnroute`
- `rnfocus`

Expected result:

- snippets expand correctly
- imports point to the expected navigation packages
- they do not corrupt existing `react-native` imports
- `rnfocus` inserts a usable `useFocusEffect` pattern with `run()` and cleanup state

## List and UI State Snippets

Verify:

- `rnempty`
- `rnloading`
- `rnerror`
- `rnskeleton`
- `rnlistheader`
- `rnsearchheader`
- `rnsectionheader`
- `rnlistempty`
- `rnrefresh`
- `rnitem`
- `rnlistitem`

Expected result:

- JSX structure is inserted
- related styles are created
- required imports are added
- no duplicated placeholder styles are introduced
- `rnlistempty` uses `ListEmptyComponent={renderListEmpty}` plus a helper, not a large inline JSX prop

## Language Split Validation

In `.jsx`:

- `rnconst` should create JS component output
- `rnexportconst` should create JS component output
- no TypeScript props type should be inserted

In `.tsx`:

- `rnconst` should create TS component output
- `rnexportconst` should create TS component output
- type alias should be inserted

## Regression Checklist

Before a release branch is cut, confirm:

- no duplicated snippet entries in completion menus
- no malformed imports after smart snippet insertion
- no invalid `StyleSheet.styles.foo` references
- no blank style rule names
- no unwanted cleanup of non-empty style rules
- no handler duplication from repeated snippet insertion
- no style alias suggestions outside style contexts

## Blocking vs Non-Blocking

Treat these as blocking:

- wrong import source for core components
- malformed code inserted by a smart snippet
- duplicate snippet entries in the same language context
- stylesheet corruption
- handler corruption or duplicated invalid code

Treat these as non-blocking only for `0.1.0` if documented:

- incomplete support for complex inline style extraction
- limited TypeScript inference edge cases
- cosmetic wording issues in docs or descriptions

## Suggested Release Sign-Off

For `release/0.1.0`, the sign-off should include:

- `npm run check` passed
- all blocking cases passed in VS Code
- smoke test passed in Cursor if Cursor support is part of release scope
- README and README.es aligned with shipped behavior
- final `.vsix` package installed and sanity-checked once
