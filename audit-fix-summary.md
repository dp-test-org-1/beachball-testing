Summary of changes to address high-or-higher pnpm audit advisories

Changed files and edits:

- package.json (root)
  - Added pnpm.overrides for transitive pins:
    - js-yaml: (none) -> 3.13.1
    - uglify-js: (none) -> 2.6.0
    - minimatch: (none) -> 9.0.9
    - flatted: (none) -> 3.4.4
    - lodash: (none) -> 4.18.1
    - sharp: (none) -> 0.35.0

  These were added as pnpm "overrides" to pin transitive dependencies to safe versions when direct bumps were not possible.

- apps/my-test-app/package.json
  - next: 15.1.6 -> 15.5.21
  - eslint-config-next: 15.1.6 -> 15.5.21

Advisories that could NOT be fixed automatically (high severity):

- timespan (advisory id: 1093858) — Regular expression DoS; no patch available. Recommendation: replace or ensure untrusted input is never passed to timespan; limit input length.

Notes:
- Ran `pnpm install --no-frozen-lockfile` and `pnpm audit --audit-level high` iteratively until no remaining advisories at severity high or greater could be resolved by safe bumps or overrides.
- All changes were limited to package.json files and pnpm overrides; lockfile (pnpm-lock.yaml) was updated by pnpm install.
