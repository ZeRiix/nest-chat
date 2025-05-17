import { duplojsEslintBase, duplojsEslintTest } from "@duplojs/eslint";

export default [
    {
        ...duplojsEslintTest,
        files: ["**/*.test.ts"],
    },
    {
        ...duplojsEslintBase,
        files: ["**/*.ts"],
        ignores: ["**/*.test.ts"],
        rules: {
            ...duplojsEslintBase.rules,
            "@typescript-eslint/no-empty-object-type": "off",
			"new-cap": "off",
			"max-classes-per-file": "off"
        },
    },
];