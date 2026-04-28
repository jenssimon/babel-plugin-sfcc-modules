import { defineConfig } from "vite-plus"

export default defineConfig({
  pack: {
    entry: ["src/index.ts"],
    format: ["esm", "cjs"],
  },
  staged: { "*": "vp check --fix" },
  lint: {
    options: {
      typeAware: true,
      typeCheck: true,
    },
    plugins: ["import", "vitest"],
  },
  fmt: {
    semi: false,
    sortImports: {
      groups: [
        "type-import",
        ["value-builtin", "value-external"],
        "type-internal",
        "value-internal",
        ["type-parent", "type-sibling", "type-index"],
        ["value-parent", "value-sibling", "value-index"],
        "unknown",
      ],
    },
  },
})
