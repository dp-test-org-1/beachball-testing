/*---------------------------------------------------------------------------------------------
 * Copyright (c) Bentley Systems, Incorporated. All rights reserved.
 * See LICENSE.md in the project root for license terms and full copyright notice.
 *--------------------------------------------------------------------------------------------*/

module.exports = {
  bumpDeps: false,
  access: "public",
  tag: "latest",
  scope: ["packages/beachball-test-adu"],
  package: "@bentley/drawing-production",
  registry: "https://pkgs.dev.azure.com/bentleycs/_packaging/Packages/npm/registry/",
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
        const commitLink = `https://github.com/iTwin/drawing-production/commit/${entry.commit}`;
        return `- ${entry.comment} ([commit](${commitLink}))`;
      }
    }
  },
  changeFilePrompt: {
    changePrompt: (defaultPrompt, pkg) => {
      return [
        defaultPrompt.changeType,
        defaultPrompt.description,
        {
          type: "select",
          name: "isStudioVersionUpgrade",
          message: "Is this a studio version upgrade?",
          choices: [
            { title: "No", value: "no" },
            { title: "Yes", value: "yes" }
          ]
        },
        {
          type: (prev) => (prev === "yes" ? "text" : null),
          name: "targetStudioVersion",
          message: "Which version of Studio was used to test these changes?(e.g. 1.0.84)"
        }
      ];
    }
  },
  verbose: true,
  generateChangelog: true,
  verbose: true
};
