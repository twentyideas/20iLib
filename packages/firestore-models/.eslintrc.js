module.exports = {
    extends: ["typescript"],
    rules: {
        "object-curly-newline": ["error", { multiline: true, consistent: true }],
        "newline-per-chained-call": "off",
        "@typescript-eslint/no-explicit-any": "off",
        "@typescript-eslint/explicit-function-return-type": "off",
        "@typescript-eslint/camelcase": "off",
        "@typescript-eslint/no-this-alias": "off",
        "@typescript-eslint/class-name-casing": "off",
        "@typescript-eslint/explicit-member-accessibility": "off",
        "@typescript-eslint/member-delimiter-style": "off",
        "@typescript-eslint/interface-name-prefix": "off"
    }
}
