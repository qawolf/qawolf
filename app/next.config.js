const withMDX = require("@next/mdx")({
  extension: /.mdx?$/,
});

const config = withMDX({
  pageExtensions: ["ts", "tsx", "md", "mdx"],
  webpack: (config) => {
    config.module.rules.push({
      test: /\.(graphql|gql)$/,
      exclude: /node_modules/,
      loader: "@graphql-tools/webpack-loader",
    });

    return config;
  },
});

module.exports = {
  ...config,
  // move to non-experimental in 10.0.5
  // broken in 10.0.4: https://github.com/vercel/next.js/issues/20500
  experimental: {
    productionBrowserSourceMaps: true,
  },
};
