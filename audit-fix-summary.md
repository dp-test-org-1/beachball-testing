Summary of high-or-higher audit fixes

Changes made:
- apps/my-test-app/package.json: next 15.1.6 -> 15.5.21
- root package.json (pnpm.overrides): pinned transitive packages to safe versions:
  - js-yaml -> 3.15.0 (previously 3.13.1 in overrides)
  - uglify-js -> 2.6.0
  - minimatch -> 9.0.9
  - brace-expansion -> 2.1.4
  - picomatch -> 2.3.2
  - flatted -> 3.4.4
  - lodash -> 4.18.1
  - postcss -> 8.5.18
  - sharp -> 0.35.0

Advisories that could not be fixed automatically:
- timespan (GHSA-f523-2f5j-gfcg / CVE-2017-16115) — affected version: 2.3.0 (path: packages__beachball-test-adu>build>timespan). No patched version is available (recommendation: replace the package with an alternative or ensure untrusted input length is strictly limited).

Validation steps performed:
- Ran: pnpm install --no-frozen-lockfile
- Ran: pnpm audit --audit-level high
- Confirmed only the timespan advisory remains at severity "high"; all other high/critical advisories were addressed via bumps or overrides.

If further remediation for "timespan" is required, recommend either:
- Update the upstream package that depends on timespan to a version that removes it; or
- Replace that dependency with an alternative package and update workspace package.json accordingly.
