// @ts-check

/**
 * @see https://prettier.io/docs/configuration
 * @type {import("prettier").Config}
 */
const config = {
  trailingComma: "es5",
  tabWidth: 2,
  useTabs: false,
  semi: true,
  singleQuote: false,
  bracketSpacing: true,
  bracketSameLine: true,
  plugins: ["@ianvs/prettier-plugin-sort-imports"],
  importOrder: [
    "^/imports/assets/gamemakerFunctions.js$",
    "^/imports/customFunctions.js$",
    "^/imports/(?!customFunctions|assets)[^/]+\\.js$",
    "^/imports/assets.js$",
    "^/imports/assets/(?!gamemakerFunctions)[^/]+\\.js$",
    "^/imports/assets/global.js$",
    "^/imports/assets/roomSize.js$",
    "",
    "^/obj/.*/index.js$",
  ],
  importOrderParserPlugins: [],
};

export default config;
