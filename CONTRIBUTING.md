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

## Protected branch restrictions

For now, treat these branches as protected workflow branches:

- `main`
- `develop`
- `release/*`

Rules:

1. Do not commit directly to `main`.
2. Do not push code directly to `main`.
3. Do not merge into `main` without an explicit release or hotfix decision.
4. Do not push feature work directly to `develop`; use `feature/*` or `fix/*` first.
5. Do not use `release/*` for regular feature development.
6. Do not force-push protected branches.
7. Do not delete protected branches without explicit approval.

## Automation restrictions

Until the repository has full branch protections configured remotely, automated agents should follow these extra restrictions:

1. Do not commit or push to `main` automatically.
2. Do not commit or push to `develop` automatically unless the user explicitly asks for it.
3. Do not create or publish `release/*` or `hotfix/*` branches automatically unless the user explicitly asks for it.
4. Do not merge branches automatically.
5. Do not tag releases automatically.
6. Do not rewrite history on shared branches.
7. Before any commit or push, summarize the branch, scope, and target branch clearly.

Recommended current working policy:

- regular work -> `feature/*`
- bug fixes -> `fix/*`
- release preparation -> `release/*`
- production emergencies -> `hotfix/*`

## Versioning and tags

Use Semantic Versioning with annotated Git tags:

- format: `v<major>.<minor>.<patch>`
- examples:
  - `v0.1.0`
  - `v0.1.1`
  - `v0.2.0`
  - `v1.0.0`

Rules:

1. Create release tags only on `main`.
2. Do not create tags on `develop`, `feature/*`, `fix/*`, or `release/*`.
3. Create a tag only after the release branch has been merged into `main`.
4. Use annotated tags, not lightweight tags.
5. Push tags explicitly after the release is on `main`.

Recommended version meaning:

- `patch` for bug fixes and backward-compatible corrections
- `minor` for new snippets, new capabilities, and backward-compatible features
- `major` for breaking changes or major public milestones

Recommended release flow:

1. Merge `release/<version>` into `main`
2. Create annotated tag on `main`
3. Push `main` and the tag
4. Merge the same release branch back into `develop`

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

The repository should maintain documentation in both English and Spanish.

Recommended structure:

- `README.md` as the Marketplace-facing primary documentation in English
- `README.es.md` as the Spanish companion for local and community support

Rules:

1. Keep both `README.md` and `README.es.md` when the project is published or prepared for publication.
2. Treat `README.md` as the public Marketplace-facing source of truth.
3. Treat `README.es.md` as the Spanish companion, not as a fork with different behavior.
4. When a feature changes and both files exist, update both or clearly note that the translation is pending.
5. Avoid introducing a feature only in one language without leaving an explicit note for follow-up.

## Validation

Before closing work:

1. Run `npm run check`.
2. Validate modified JSON files.
3. Mention any untested interactive behavior.
