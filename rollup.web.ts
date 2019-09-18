import typescript from "rollup-plugin-typescript";

export default {
  input: "./src/qawolf.web.ts",
  output: {
    file: "./build/qawolf.web.js",
    format: "iife",
    name: "qawolf"
  },
  onwarn: (warning, next) => {
    if (warning.code === "THIS_IS_UNDEFINED") return;
    next(warning);
  },
  plugins: [typescript()]
};
