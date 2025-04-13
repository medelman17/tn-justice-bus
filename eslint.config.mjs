import { dirname } from "path";
import { fileURLToPath } from "url";
import { FlatCompat } from "@eslint/eslintrc";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const compat = new FlatCompat({
  baseDirectory: __dirname,
});

const eslintConfig = [
  ...compat.extends("next/core-web-vitals", "next/typescript"),
  {
    rules: {
      "@typescript-eslint/no-unused-vars": "off",
    },
  },
  // Add overrides for test files
  {
    files: ["**/*.test.ts", "**/*.test.tsx", "**/test/**/*.ts", "**/test/**/*.tsx", "**/tests/**/*.ts", "**/tests/**/*.tsx", "**/setup.ts"],
    rules: {
      // Allow 'any' type in test files
      "@typescript-eslint/no-explicit-any": "off",
      // Allow var in test files (mostly for setup.ts)
      "no-var": "off",
      // Other common test-specific overrides
      "@typescript-eslint/no-non-null-assertion": "off",
      "@typescript-eslint/no-empty-function": "off",
    },
  },
];

export default eslintConfig;
