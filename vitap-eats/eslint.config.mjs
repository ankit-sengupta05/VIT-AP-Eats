import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";

const eslintConfig = defineConfig([
  ...nextVitals,
  ...nextTs,
  // Override default ignores of eslint-config-next.
  globalIgnores([
    // Default ignores of eslint-config-next:
    ".next/**",
    "out/**",
    "build/**",
    "next-env.d.ts",
  ]),
  {
    rules: {
      // The API layer wraps a backend whose exact response shapes aren't
      // modeled in TS yet. Blanket-banning `any` here would require guessing
      // at real payload shapes; keep this as a warning (visible, not blocking)
      // until the API client gets proper generated/shared types.
      "@typescript-eslint/no-explicit-any": "warn",
      // Newer rule from eslint-plugin-react-hooks flags several legitimate
      // "sync local state when a prop/flag changes" effects (dialogs,
      // one-shot timers) across the app. Left as a warning pending a
      // deliberate pass to restructure those components.
      "react-hooks/set-state-in-effect": "warn",
    },
  },
  {
    // Plain Node/CommonJS utility scripts, not part of the app bundle.
    files: ["scripts/**/*.js"],
    rules: {
      "@typescript-eslint/no-require-imports": "off",
    },
  },
]);

export default eslintConfig;
