/*---------------------------------------------------------------------------------------------
 * Copyright (c) Bentley Systems, Incorporated. All rights reserved.
 * See LICENSE.md in the project root for license terms and full copyright notice.
 *--------------------------------------------------------------------------------------------*/

const fs = require("fs");
const path = require("path");
const iTwinPlugin = require("@itwin/eslint-plugin");
const prettierConfig = require("eslint-config-prettier");
const jsdoc = require("eslint-plugin-jsdoc");
const react = require("eslint-plugin-react");
const header = require("eslint-plugin-header");
const eslintPluginSimpleImport = require("eslint-plugin-simple-import-sort");
const filenameRules = require("eslint-plugin-filename-rules");
const eslintPluginJest = require("eslint-plugin-jest");

const copyrightHeader = [
  `---------------------------------------------------------------------------------------------`,
  ` * Copyright (c) Bentley Systems, Incorporated. All rights reserved.`,
  ` * See LICENSE.md in the project root for license terms and full copyright notice.`,
  ` *--------------------------------------------------------------------------------------------`
];
const customLanguageOptions = {
  sourceType: "module",
  parser: require("@typescript-eslint/parser"),
  parserOptions: {
    ecmaVersion: "2020",
    tsconfigRootDir: __dirname,
    EXPERIMENTAL_useProjectService: true, // see https://typescript-eslint.io/packages/parser#experimental_useprojectservice
    project: "./tsconfig.json"
  }
};

module.exports = [
  {
    ignores: [...fs.readFileSync(path.join(__dirname, ".prettierignore"), "utf8").split("\n"), "**/*.d.ts"]
  },
  {
    settings: {
      react: {
        version: "detect" // Tells eslint-plugin-react to automatically detect the version of React to use
      }
    },
    plugins: {
      jsdoc,
      react,
      header,
      "simple-import-sort": eslintPluginSimpleImport
    },
    rules: {
      // Place to specify ESLint rules. Can be used to overwrite rules specified from the extended configs
      "simple-import-sort/imports": [
        "error",
        {
          groups: [
            // React Packages
            ["^react"],
            // Built-In
            [
              "^(assert|buffer|child_process|cluster|console|constants|crypto|dgram|dns|domain|events|fs|http|https|module|net|os|path|punycode|querystring|readline|repl|stream|string_decoder|sys|timers|tls|tty|url|util|vm|zlib|freelist|v8|process|async_hooks|http2|perf_hooks)(/.*|$)"
            ],
            // External packages
            ["^@?\\w"],
            // Absolute imports and other imports such as Vue-style `@/foo`. Anything not matched in another group.
            ["^"],
            // Relative imports.
            ["^\\."],
            // Side effect imports. e.g. import 'style.css';
            ["^\\u0000"]
          ]
        }
      ],
      "react/prop-types": "off",
      "react/function-component-definition": [
        1,
        {
          namedComponents: "arrow-function",
          unnamedComponents: "arrow-function"
        }
      ],
      "react/display-name": "off",
      "react/self-closing-comp": [1],
      "curly": "error",
      "@typescript-eslint/explicit-module-boundary-types": "off",
      "react/react-in-jsx-scope": "off",
      "react/jsx-uses-react": "off",
      "header/header": [2, "block", copyrightHeader, 2],
      "@typescript-eslint/quotes": "off",
      "quote-props": "off",
      "@typescript-eslint/no-non-null-assertion": "off",
      "no-console": ["warn", { allow: ["error"] }]
    }
  },
  {
    files: ["**/*.{js,ts,tsx}"],
    languageOptions: customLanguageOptions,
    rules: {
      "padding-line-between-statements": [
        "error",
        // Force new lines before return statements
        { blankLine: "always", prev: "block-like", next: "return" }
      ]
    }
  },
  {
    // Config for all typescript files (except React components)
    files: ["packages/**/*.ts*"],
    ...iTwinPlugin.configs.iTwinjsRecommendedConfig,
    languageOptions: customLanguageOptions
  },
  {
    files: ["**/hooks/*.ts*"],
    plugins: { "filename-rules": filenameRules },
    rules: {
      "filename-rules/match": [2, { ".tsx": /^[u][s][e]+((\d)|([A-Z0-9][a-z0-9]+))*([A-Z])?(?:\..*)?$/ }]
    }
  },
  {
    files: ["**/*.test.{ts,tsx}"],
    plugins: { jest: eslintPluginJest },
    languageOptions: {
      globals: eslintPluginJest.environments.globals.globals
    }
  },
  prettierConfig
];
