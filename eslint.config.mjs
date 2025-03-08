import { dirname } from "path";
import { fileURLToPath } from "url";
import { FlatCompat } from "@eslint/eslintrc";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const compat = new FlatCompat({
  baseDirectory: __dirname,
});

// Configure enhanced linting rules for TowTrace
const eslintConfig = [
  ...compat.extends("next/core-web-vitals", "next/typescript"),
  {
    rules: {
      // Enforce JSDoc comments
      "jsdoc/require-jsdoc": ["warn", {
        publicOnly: true,
        require: {
          FunctionDeclaration: true,
          MethodDefinition: true,
          ClassDeclaration: true,
          ArrowFunctionExpression: true,
          FunctionExpression: true
        }
      }],
      
      // Function size limits
      "max-lines-per-function": ["warn", { max: 50, skipBlankLines: true, skipComments: true }],
      "max-params": ["warn", 4],
      
      // Clean code principles
      "no-magic-numbers": ["warn", { ignore: [0, 1, -1], ignoreDefaultValues: true }],
      "no-unused-vars": "error",
      "no-console": ["warn", { allow: ["warn", "error"] }],
      
      // React specific rules
      "react-hooks/rules-of-hooks": "error",
      "react-hooks/exhaustive-deps": "warn",
    }
  },
  {
    // Relax rules for configuration files
    files: ["*.config.js", "*.config.mjs", "*.config.ts"],
    rules: {
      "jsdoc/require-jsdoc": "off",
      "max-lines-per-function": "off",
      "no-magic-numbers": "off"
    }
  },
  {
    // Page components can be up to 100 lines
    files: ["**/pages/**/*.tsx", "**/app/**/*.tsx"],
    rules: {
      "max-lines-per-function": ["warn", { max: 100, skipBlankLines: true, skipComments: true }]
    }
  }
];

export default eslintConfig;
