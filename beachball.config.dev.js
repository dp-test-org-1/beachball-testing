/*---------------------------------------------------------------------------------------------
 * Copyright (c) Adu21, Incorporated. All rights reserved.
 * See LICENSE.md in the project root for license terms and full copyright notice.
 *--------------------------------------------------------------------------------------------*/

const base = require("./beachball.config.js");

/** @type {import("beachball").BeachballConfig } */
module.exports = {
  ...base,
  scope: ["packages/beachball-test-adu"],
  changehint: "Run 'pnpm change:dev' to generate a change file",
  tag: "nightly",
  prereleasePrefix: "dev",
  changelog: false
};
