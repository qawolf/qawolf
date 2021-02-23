const path = require("path");

module.exports = async ({ config }) => {
  // fonts
  config.module.rules.push({
    test: /\.(png|woff|woff2|eot|ttf|svg)$/,
    use: [
      {
        loader: "file-loader",
        query: {
          name: "[name].[ext]",
        },
      },
    ],
    include: path.resolve(__dirname, "../"),
  });

  return config;
};
