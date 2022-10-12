import { terser } from "rollup-plugin-terser";
import copy from "rollup-plugin-copy";

/** @type {import("rollup").RollupOptions} */
export default {
  input: "src/gat.js",
  output: {
    dir: "dist",
    format: "es",
    sourcemap: true,
    plugins: [terser({ keep_classnames: true, keep_fnames: true })],
  },
  plugins: [copy({ targets: [{ src: "public/*", dest: "dist" }] })],
};
