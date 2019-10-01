import commonjs from "rollup-plugin-commonjs";
import nodeBuiltins from "rollup-plugin-node-builtins";
import nodeGlobals from "rollup-plugin-node-globals";
import nodeResolve from "rollup-plugin-node-resolve";
import typescript from "rollup-plugin-typescript";

export default {
  input: "./src/web/index.ts",
  output: {
    file: "./dist/qawolf.web.js",
    format: "iife",
    name: "qawolf"
  },
  onwarn: (warning, next) => {
    if (warning.code === "THIS_IS_UNDEFINED") return;
    next(warning);
  },
  plugins: [
    commonjs(),
    nodeBuiltins(),
    nodeGlobals(),
    nodeResolve({ browser: true }),
    typescript()
  ]
};
