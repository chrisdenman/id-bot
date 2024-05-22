import pluginJs from "@eslint/js";
// noinspection NpmUsedModulesInstalled
import globals from "globals";

// noinspection JSUnusedGlobalSymbols
export default [
    pluginJs.configs.recommended,
    {
        rules: {
            "quotes": ["error", "double", { "allowTemplateLiterals": true }],
            "no-duplicate-imports": ["error"],
            "semi": ["error", "always"],
            "no-template-curly-in-string": ["error"],
            "no-use-before-define": ["error"],
            "require-atomic-updates": ["error"],
            "newline-before-return": ["error"],
            "no-alert": ["error"],
            "no-extend-native": ["error"],
            "no-throw-literal": ["error"],
            "no-unused-expressions": ["error"],
            "no-useless-rename": ["error"],
            "no-useless-return": ["error"],
            "no-var": ["error"],
            "vars-on-top": ["error"],
            "no-sequences": ["error"],
            "no-shadow": ["error"],
            "no-param-reassign": ["error"],
        },
        languageOptions: {
            ecmaVersion: "latest",
            sourceType: "module",
            globals: {
                ...globals.node,
                ...globals.jest
            }
        }
    }
];
