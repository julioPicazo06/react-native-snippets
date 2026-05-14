# Contributing

## Branching model

This repository should follow a lightweight Git Flow style:

- `main`
  Stable production branch. Only release-ready code should land here.
- `develop`
  Integration branch for ongoing work before a release.
- `feature/<scope>-<short-description>`
  New work and enhancements.
- `fix/<scope>-<short-description>`
  Non-urgent bug fixes.
- `release/<version>`
  Release stabilization branch, for example `release/0.1.0`.
- `hotfix/<scope>-<short-description>`
  Urgent fixes branched from `main`.

## Daily workflow

Recommended day-to-day flow:

1. Branch from `develop` into a `feature/*` or `fix/*` branch.
2. Open a pull request back into `develop`.
3. When the next public version is close, cut `release/<version>` from `develop`.
4. Use the release branch only for stabilization, docs polish, versioning, and final fixes.
5. Merge `release/<version>` into `main` for the public release.
6. Merge the same `release/<version>` back into `develop` so both branches stay aligned.
7. If a production issue appears after release, branch `hotfix/*` from `main`, merge it back into both `main` and `develop`.

Recommended examples:

- `feature/navigation-typed-support`
- `fix/style-inline-extract`
- `release/0.1.0`
- `hotfix/import-safe-area-view`

## Commit convention

Use Conventional Commits in English:

```text
<type>(<scope>): <description>
```

Examples:

- `feat(list): add smart list empty state snippets`
- `fix(style): avoid duplicate stylesheet placeholders`
- `docs(readme): document inline style extraction`

Recommended types:

- `feat`
- `fix`
- `refactor`
- `docs`
- `test`
- `chore`

This convention is enforced with a `husky` `commit-msg` hook.

Recommended scopes:

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

## Documentation language

The Marketplace-facing primary documentation should be in English.

Recommended structure:

- `README.md` in English
- `README.es.md` or separate Spanish docs as secondary documentation

If the project keeps documentation in two languages, feature changes should update both or clearly note that the translation is pending.

## Validation

Before closing work:

1. Run `npm run check`.
2. Validate modified JSON files.
3. Mention any untested interactive behavior.
