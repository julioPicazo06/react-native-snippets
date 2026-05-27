---
name: react-native-snippet-lab-maintainer
description: Use when working on this React Native Snippet Lab extension to keep features consistent, check for existing similar behavior before implementing, and update documentation whenever snippets or extension behavior change.
---

# React Native Snippet Lab Maintainer

Use this skill when adding, changing, or reviewing snippets, completions, code actions, style helpers, or documentation in this repository.

## Before implementing

1. Search the repo for similar behavior, existing prefixes, related config, or nearby heuristics.
2. Tell the user what already exists and whether the new work extends it, replaces it, or conflicts with it.
3. Prefer extending current behavior over creating a parallel path when the repo already has a close match.

## Required update rules

Whenever a new snippet, completion, code action, setting, or smart behavior is added or changed:

1. Update `README.md` in the same turn.
2. If the change affects testing steps or expected UX, update `TESTING.md` if it exists. If it does not exist yet, mention the testing impact in the final response.
3. If snippet language separation matters, verify the correct file among:
   - `snippets/react-native-snippets.json`
   - `snippets/react-native-js-snippets.json`
   - `snippets/react-native-ts-snippets.json`

## Consistency rules

1. Avoid duplicate prefixes in the same language context.
2. Preserve existing naming patterns like `container`, `content`, `header`, `footer`, `icon`, `input`, `label`.
3. Prefer contextual heuristics over global noisy completions.
4. New automation should be configurable when it could surprise the user.

## Language and commit rules

1. Use English for new commit messages and new repo-facing workflow text.
2. Treat `main` as the stable production branch. Do not use `master`.
3. Use this branching model:
   - `main` for stable releases only
   - `develop` for integration work
   - `feature/<scope>-<short-description>` for new work
   - `fix/<scope>-<short-description>` for bug fixes
   - `release/<version>` for release stabilization
   - `hotfix/<scope>-<short-description>` for urgent fixes from `main`
4. Use Conventional Commit style with this format:
   - `<type>(<scope>): <description>`
5. Keep `type`, `scope`, and `description` in lowercase unless a proper noun requires uppercase.
6. Keep the scope singular and focused on the main area changed.
7. Prefer imperative descriptions such as:
   - `fix(component): avoid duplicate snippet entries`
   - `feat(snippet): add smart empty state snippets`
   - `docs(readme): document style value aliases`

## Documentation language rules

1. Keep repository documentation in both English and Spanish when the bilingual structure exists.
2. Keep `README.md` as the Marketplace-facing primary documentation in English.
3. Keep `README.es.md` as the Spanish companion for local and community support.
4. When a feature changes and the repo has both files, update both or explicitly note the pending translation.
5. Do not let the Spanish documentation drift into a different product description or feature set.

Recommended commit types:

- `feat`
- `fix`
- `refactor`
- `docs`
- `test`
- `chore`

Recommended scopes for this repo:

- `snippet`
- `component`
- `style`
- `import`
- `navigation`
- `form`
- `list`
- `type`
- `readme`
- `testing`

Before suggesting or creating a commit:

1. Summarize the main change in one short sentence.
2. Choose the narrowest useful scope.
3. Prefer English wording even if the conversation with the user is in Spanish.

Branch usage rules:

1. Start new product work from `develop` using `feature/*`.
2. Start non-urgent fixes from `develop` using `fix/*`.
3. Cut `release/<version>` from `develop` only when preparing a real release candidate.
4. Cut `hotfix/*` from `main` only for urgent production issues.
5. After a release or hotfix, make sure changes flow back into `develop`.
6. Treat `main`, `develop`, and `release/*` as protected workflow branches.
7. Do not commit or push directly to `main`.
8. Do not commit or push to `develop`, `release/*`, or `hotfix/*` unless the user explicitly asks for it.
9. Do not merge branches automatically.
10. Do not create tags automatically.
11. Do not force-push shared branches.
12. Before any commit or push, state the branch and target clearly.

Tagging and version rules:

1. Use Semantic Versioning with annotated tags in the format `v<major>.<minor>.<patch>`.
2. Create tags only on `main`.
3. Do not create tags on `develop`, `feature/*`, `fix/*`, or `release/*`.
4. Create a release tag only after `release/<version>` has been merged into `main`.
5. Do not create or push tags automatically unless the user explicitly asks for it.
6. Treat `patch` as fixes, `minor` as backward-compatible features, and `major` as breaking changes or major milestones.

## Validation

After changes:

1. Run `npm run check`.
2. Validate changed JSON files parse correctly.
3. Mention any untested interactive behavior explicitly.
