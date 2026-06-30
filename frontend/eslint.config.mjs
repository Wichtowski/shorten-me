import nextCoreWebVitals from "eslint-config-next/core-web-vitals";
import nextTypescript from "eslint-config-next/typescript";

const eslintConfig = [
  ...nextCoreWebVitals,
  ...nextTypescript,
  {
    ignores: ["dist/**", ".next/**", ".wrangler/**", ".vinext/**", "wrangler.local.jsonc"]
  },
  {
    rules: {
      "@typescript-eslint/no-explicit-any": "error",
      "prefer-const": "warn",
      "@typescript-eslint/no-unused-vars": "error",
      "@typescript-eslint/no-unused-expressions": "error"
    }
  }
];

export default eslintConfig;
