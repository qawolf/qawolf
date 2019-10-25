import commonjs from "rollup-plugin-commonjs";
import nodeResolve from "rollup-plugin-node-resolve";
import typescript from "rollup-plugin-typescript";

export default {
  input: "./src/index.ts",
  output: {
    file: "./lib/qawolf.web.js",
    format: "iife",
    name: "qawolf",
    outro: "console.log('loaded qawolf');"
  },
  onwarn: (warning, next) => {
    if (warning.code === "THIS_IS_UNDEFINED") return;
    next(warning);
  },
  plugins: [commonjs(), nodeResolve({ browser: true }), typescript()]
};
