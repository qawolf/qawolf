/**
 * Copyright (c) 2017-present, Facebook, Inc.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

module.exports = {
  title: "QA Wolf",
  tagline: "Create browser tests 10x faster",
  url: "https://docs.qawolf.com",
  baseUrl: "/",
  favicon: "img/favicon.ico",
  organizationName: "qawolf", // Usually your GitHub org/user name.
  projectName: "qawolf", // Usually your repo name.
  themeConfig: {
    navbar: {
      title: "QA Wolf",
      logo: {
        alt: "Spirit the QA Wolf",
        src: "img/logo.png"
      },
      links: [
        { to: "docs/get_started", label: "Docs", position: "left" },
        {
          to: "docs/api",
          label: "API"
        },
        {
          href: "https://gitter.im/qawolf/community",
          label: "Chat"
        },
        {
          href: "mailto:jon@qawolf.com",
          label: "Email"
        },
        {
          href: "https://github.com/qawolf/qawolf",
          label: "GitHub",
          position: "right"
        }
      ]
    },
    footer: {
      style: "dark",
      logo: {
        alt: "Spirit the QA Wolf",
        src: "img/logo_small.png"
      },
      copyright: `Copyright © ${new Date().getFullYear()} QA Wolf. Built with Docusaurus.`,
      links: [
        {
          items: [
            {
              to: "http://eepurl.com/gM47dD",
              label: "Subscribe to Updates"
            }
          ]
        }
      ]
    },
    algolia: {
      apiKey: process.env.ALGOLIA_API_KEY,
      indexName: "qawolf"
    }
  },
  presets: [
    [
      "@docusaurus/preset-classic",
      {
        docs: {
          sidebarPath: require.resolve("./sidebars.js")
        },
        theme: {
          customCss: require.resolve("./src/css/custom.css")
        }
      }
    ]
  ]
};
