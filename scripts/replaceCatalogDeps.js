/*---------------------------------------------------------------------------------------------
 * Copyright (c) Adu21, Incorporated. All rights reserved.
 * See LICENSE.md in the project root for license terms and full copyright notice.
 *--------------------------------------------------------------------------------------------*/

/**
 * Replace the `workspace:` and the `catalog:*` dependencies in the package listed as the first argument:
 * e.g., `node scripts/replaceCatalogDeps.js @bentley/studio-apps-backend-api`
 */

const fs = require("fs");
const path = require("path");
const yaml = require("js-yaml");
const workspaceTools = require("workspace-tools");

if (process.argv.length < 3) {
  console.error("Usage: node scripts/replaceCatalogDeps.js <package>");
  process.exit(1);
}

async function main() {
  const workspaceRoot = workspaceTools.getWorkspaceRoot(process.cwd());
  const workspaceFile = path.join(workspaceRoot, "pnpm-workspace.yaml");
  const workspace = yaml.load(fs.readFileSync(workspaceFile, "utf8"));
  const catalogs = workspace.catalogs;
  const pkgJson = workspaceTools.getPackageInfos(workspaceRoot)[process.argv[2]];

  for (const depType of ["dependencies", "devDependencies", "peerDependencies"]) {
    for (const dep in pkgJson[depType]) {
      const version = pkgJson[depType][dep];
      if (version.startsWith("workspace:")) {
        const replacementVersion = workspaceTools.getPackageInfos(workspaceRoot)[dep].version;
        if (replacementVersion === undefined) throw Error(`unsupported workspace dependency: ${dep}`);
        pkgJson[depType][dep] = replacementVersion;
      } else if (version.startsWith("catalog:")) {
        const catalogName = version.split(":")[1];
        const catalogDeps = catalogs[catalogName];
        if (catalogDeps === undefined) throw Error(`unsupported catalog:${catalogName} found in ${dep}`);
        const replacementVersion = catalogDeps[dep];
        if (replacementVersion === undefined) throw Error(`unsupported catalog:${catalogName} dependency: ${dep}`);
        pkgJson[depType][dep] = replacementVersion;
      }
    }
  }
  const pkgJsonPath = pkgJson.packageJsonPath;
  delete pkgJson.packageJsonPath; // we don't want to publish this

  await fs.promises.writeFile(pkgJsonPath, JSON.stringify(pkgJson, undefined, "  "));
}

if (module === require.main) main();
