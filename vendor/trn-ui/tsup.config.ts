import { defineConfig } from "tsup";

export default defineConfig({
  entry: ["src/index.ts", "src/glb-scene-tree/index.ts", "src/pie-menu/index.ts"],
  format: ["esm"],
  dts: false,
  sourcemap: true,
  clean: true,
  splitting: false,
  treeshake: true,
  external: [
    "react",
    "react-dom",
    "react/jsx-runtime",
    "react/jsx-dev-runtime",
  ],
});
