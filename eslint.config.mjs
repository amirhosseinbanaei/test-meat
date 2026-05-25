import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";

const eslintConfig = defineConfig([
  ...nextVitals,
  ...nextTs,
  {
    rules: {
      // This is an art-directed, pixel-perfect landing page rebuilt from a
      // fixed 1920px design canvas. Imagery lives in CSS-controlled
      // containers (background-image, object-fit, fixed px boxes). next/image's
      // wrapper markup and sizing heuristics fight that layout, so plain <img>
      // and CSS backgrounds are intentional here.
      "@next/next/no-img-element": "off",
    },
  },
  globalIgnores([".next/**", "out/**", "build/**", "next-env.d.ts"]),
]);

export default eslintConfig;
