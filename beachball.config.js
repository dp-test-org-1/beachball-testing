/*---------------------------------------------------------------------------------------------
 * Copyright (c) Adu21, Incorporated. All rights reserved.
 * See LICENSE.md in the project root for license terms and full copyright notice.
 *--------------------------------------------------------------------------------------------*/

module.exports = {
  bumpDeps: false,
  access: "public",
  tag: "latest",
  scope: ["packages/beachball-test-adu"],
  package: "@adu21/beachball-test-adu",
  registry: "http://localhost:4873/",
  ignorePatterns: [
    "eslint.config.js",
    "prettier-config.js",
    "tsconfig.*",
    ".*ignore",
    ".github/**",
    ".husky/**",
    ".vscode/**",
    "**/test/**",
    "**/tests/**",
    "**/e2e/**",
    "pnpm-lock.yaml"
  ],
  changehint: "Run 'pnpm change' to generate a change file",
  changelog: {
    customRenderers: {
      renderEntry: (entry) => {
        const commitLink = `https://github.com/dp-test-org-1/beachball-testing/commit/${entry.commit}`;
        return `- ${entry.comment} ([commit](${commitLink}))`;
      }
    }
  },

  verbose: true,
  generateChangelog: true,
  verbose: true,
  hooks: {
    prepublish: (_, name, version) => {
      // beachball doesn't support pnpm catalog dependencies, so we do it here
      console.log(`Replacing catalog and workspace dependencies for ${name}@${version}`);
      const { spawnSync } = require("child_process");
      const path = require("path");
      const scriptPath = path.join(__dirname, "scripts", "replaceCatalogDeps.js");
      const result = spawnSync("node", [scriptPath, name], { stdio: "inherit" });
      if (result.error) throw result.error;
    }
  }
};
