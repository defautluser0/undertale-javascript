import { dirname } from "path";
import { fileURLToPath } from "url";
import prettierConfig from "./prettier.config.js";
import js from "@eslint/js";
import tsParser from "@typescript-eslint/parser";
import importPlugin from "eslint-plugin-import";
import jsdoc from "eslint-plugin-jsdoc";
import prettierPlugin from "eslint-plugin-prettier";
import { defineConfig, globalIgnores } from "eslint/config";
import globals from "globals";

const __dirname = dirname(fileURLToPath(import.meta.url));

export default defineConfig([
  globalIgnores(
    ["imports/howler.js", "node_modules"],
    "Ignore 3rd party stuff (not our problem to lint)"
  ),
  {
    files: ["**/*.js"],
    extends: ["js/recommended"],
    languageOptions: {
      ecmaVersion: "latest",
      sourceType: "module",
      globals: globals.browser,
    },
    plugins: {
      js,
      import: importPlugin,
      prettier: prettierPlugin,
    },
    rules: {
      "prettier/prettier": ["error", prettierConfig],
      "no-unused-vars": ["warn", { argsIgnorePattern: "^_" }],
      "no-prototype-builtins": "off",
      "no-constant-binary-expression": "off",
      "no-redeclare": "off",
      "jsdoc/require-jsdoc": "off",
    },
  },
  {
    files: ["imports/assets/gamemakerFunctions.js"],
    languageOptions: {
      parser: tsParser,
      parserOptions: {
        project: "./tsconfig.json",
        tsconfigRootDir: __dirname,
        createDefaultProgram: true,
        sourceType: "module",
        ecmaVersion: "latest",
      },
    },
    settings: {
      jsdoc: {
        mode: "typescript",
        tagNamePreference: {},
        tsconfigRootDir: __dirname,
      },
    },
    plugins: {
      js,
      jsdoc,
      import: importPlugin,
      prettier: prettierPlugin,
    },
    extends: ["js/recommended", jsdoc.configs["flat/recommended"]],
    rules: {
      "prettier/prettier": ["error", prettierConfig],
      "no-unused-vars": ["warn", { argsIgnorePattern: "^_" }],
      "no-prototype-builtins": "off",
      "no-constant-binary-expression": "off",
      "no-redeclare": "off",
      "jsdoc/require-jsdoc": [
        "warn",
        {
          require: {
            FunctionDeclaration: true,
          },
        },
      ],
      "jsdoc/no-undefined-types": [
        "error",
        {
          definedTypes: [
            "Real",
            "Sound",
            "SoundInstance",
            "Obj",
            "Instance",
            "Colour",
            "Font",
            "KeyConstant",
            "Room",
            "Targetable",
            "Sprite",
            "Script",
            "Background",
            "RoomIndex",
            "PathAsset",
            "ID",
            "Tileset",
            "TileData",
            "Surface",
            "SurfaceId",
            "Buffer",
            "BufferType",
          ],
        },
      ],
      "jsdoc/require-param": "warn",
      "jsdoc/require-returns": "warn",
      "jsdoc/require-returns-check": "off",
      "jsdoc/require-returns-description": "off",
    },
  },
]);
