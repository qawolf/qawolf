const withMDX = require("@next/mdx")({
  extension: /.mdx?$/,
});

const config = withMDX({
  pageExtensions: ["ts", "tsx", "md", "mdx"],
  webpack: (config, { webpack }) => {
    config.module.rules.push({
      test: /\.(graphql|gql)$/,
      exclude: /node_modules/,
      loader: "@graphql-tools/webpack-loader",
    });

    if (process.env.NETLIFY) {
      // https://github.com/knex/knex/issues/1446#issuecomment-253245823
      config.plugins.push(
        ...[
          /mariasql/,
          /mssql/,
          /mysql/,
          /mysql2/,
          /oracle/,
          /oracledb/,
          /pg-query-stream/,
          /sqlite3/,
          /strong-oracle/,
        ].map((pattern) => new webpack.IgnorePlugin(pattern, /\/knex\//))
      );
      config.plugins.push(new webpack.IgnorePlugin(/pg-native/, /\/pg\//));
    }

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
  target: "serverless",
};
