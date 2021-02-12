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
      // const nodeExternals = require("webpack-node-externals");
      // config.externals.push(nodeExternals());

      // https://community.netlify.com/t/unable-to-publish-function-using-postgres/12293/2
      // https://github.com/knex/knex/issues/1446#issuecomment-253245823
      config.plugins.push(
        ...[
          new webpack.IgnorePlugin(/mariasql/, /\/knex\//),
          new webpack.IgnorePlugin(/mssql/, /\/knex\//),
          new webpack.IgnorePlugin(/mysql/, /\/knex\//),
          new webpack.IgnorePlugin(/mysql2/, /\/knex\//),
          new webpack.IgnorePlugin(/oracle/, /\/knex\//),
          new webpack.IgnorePlugin(/oracledb/, /\/knex\//),
          new webpack.IgnorePlugin(/pg-native/, /\/pg\//),
          new webpack.IgnorePlugin(/pg-query-stream/, /\/knex\//),
          new webpack.IgnorePlugin(/sqlite3/, /\/knex\//),
          new webpack.IgnorePlugin(/strong-oracle/, /\/knex\//),
        ]
      );
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
