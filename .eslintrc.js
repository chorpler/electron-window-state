
module.exports = {
  "root": true,
  "parser": "@typescript-eslint/parser",
  "parserOptions": {
    "ecmaVersion": 2017,
    "sourceType": "module"
  },
  "plugins": [
    "@typescript-eslint",
    "eslint-plugin-html",
    "css"
  ],
  "extends": [
    "plugin:css/recommended"
  ],
  "rules": {
    "@typescript-eslint/naming-convention": "off",
    "space-before-function-paren": [0, { anonymous: "off", named: "never", asyncArrow: "always" } ],
    // "space-before-function-paren": {
    //   "anonymous": "off",
    //   "named": "never",
    //   "asyncArrow": "always"
    // },
    // "keyword-spacing": [ "error", {
    //   "before": true,
    //   "after": false,
    // }],
    "keyword-spacing": [2, { "overrides": { "if": { "after": false }, "for": { "after": false }, "while": { "after": false }, "static": { "after": false }, "as": { "after": false } } }],
    "@typescript-eslint/method-signature-style": "warn",
    "curly": "warn",
    // "eqeqeq": "warn",
    "eqeqeq": "off",
    "no-throw-literal": "warn",
    "semi": "warn"
  },
  "ignorePatterns": [
    "out",
    "dist",
    "**/*.d.ts"
  ]
};

// {
//     "env": {
//         "jasmine": true,
//         "node": true,
//         "mocha": true,
//         "browser": true,
//         "builtin": true,
//         "es6": true
//     },
//     "ecmaFeatures": {
//       "modules": true,
//     },
//     "rules": {
//         "camelcase": 2,
//         "curly": [ 2, "all" ],
//         "dot-notation": [ 2, { "allowKeywords": true } ],
//         "eqeqeq": [ 2, "allow-null" ],
//         "strict": [ 2, "global" ],
//         "guard-for-in": 2,
//         "new-cap": 2,
//         "no-bitwise": 2,
//         "no-caller": 2,
//         "no-cond-assign": [ 2, "except-parens" ],
//         "no-console": 1,
//         "no-duplicate-case": 2,
//         "no-ex-assign": 2,
//         "no-extra-boolean-cast": 1,
//         "no-extra-semi": 1,
//         "no-negated-in-lhs": 2,
//         "no-obj-calls": 2,
//         "no-sparse-arrays": 2,
//         "no-unreachable": 1,

//         "no-debugger": 2,
//         "no-empty": 2,
//         "no-eval": 2,
//         "no-extend-native": 2,
//         "no-irregular-whitespace": 2,
//         "no-iterator": 2,
//         "no-loop-func": 2,
//         "no-multi-str": 2,
//         "no-new": 2,
//         "no-proto": 2,
//         "no-script-url": 2,
//         "no-sequences": 2,
//         "no-shadow": 2,
//         "no-undef": 2,
//         "no-unused-vars": 1,
//         "no-with": 2,
//         "quotes": [ 2, "single" ],
//         "semi": [ 0, "never" ],
//         "block-scoped-var": 2,
//         "wrap-iife": [ 2, "inside" ]
//     }
// }

// module.exports = {
//     ignorePatterns: ['**/*.d.ts', '**/*.test.ts', '**/*.js'],
//     parser: '@typescript-eslint/parser',
//     extends: ['plugin:@typescript-eslint/recommended'],
//     // plugins: ['header'],
//     plugins: [],
//     parserOptions: {
//       ecmaVersion: 2017, // Allows for the parsing of modern ECMAScript features
//       sourceType: 'module', // Allows for the use of imports
//     },
//     rules: {
//       '@typescript-eslint/no-use-before-define': 'off',
//       '@typescript-eslint/explicit-function-return-type': 'off',
//       '@typescript-eslint/no-non-null-assertion': 'off',
//       '@typescript-eslint/explicit-module-boundary-types': 'off',
//       // 'header/header': [
//       //   'error',
//       //   'block',
//       //   '---------------------------------------------------------\n * Copyright (C) Microsoft Corporation. All rights reserved.\n *--------------------------------------------------------',
//       // ],
//       // Place to specify ESLint rules. Can be used to overwrite rules specified from the extended configs
//       // e.g. "@typescript-eslint/explicit-function-return-type": "off",
//       semi: 2,
//       'prefer-const': 1,
//       curly: 2,
//     },
//   }
