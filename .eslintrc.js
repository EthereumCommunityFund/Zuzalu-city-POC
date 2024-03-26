const config = {
  env: {
    browser: true,
    es2021: true,
    node: true,
  },
  extends: [
    "eslint:recommended",
    "plugin:@typescript-eslint/recommended",
    "plugin:react/recommended",
    "react-app",
    "plugin:@typescript-eslint/recommended",
    "plugin:prettier/recommended",
    "plugin:unicorn/recommended",
  ],
  overrides: [
    {
      env: {
        node: true,
      },
      files: [".eslintrc.{js,cjs}"],
      parserOptions: {
        sourceType: "script",
      },
    },
  ],
  parser: "@typescript-eslint/parser",
  parserOptions: {
    ecmaVersion: "latest",
    sourceType: "module",
  },
  plugins: ["@typescript-eslint", "react", "prettier", "unicorn"],
  rules: {
    "prettier/prettier": "warn",
    "unicorn/filename-case": [
      "error",
      {
        cases: {
          camelCase: true,
          pascalCase: true,
        },
      },
    ],
    "unicorn/consistent-destructuring": "error",
    "unicorn/consistent-function-scoping": "error",
    "unicorn/custom-error-definition": "off",
    "unicorn/empty-brace-spaces": "error",
    "unicorn/error-message": "error",
    "unicorn/escape-case": "error",
    "no-nested-ternary": "off",
    "unicorn/no-nested-ternary": "error",
    "unicorn/no-unnecessary-await": "error",
    "unicorn/no-unreadable-array-destructuring": "error",
    "unicorn/no-unreadable-iife": "error",
  },
};

export default config;
