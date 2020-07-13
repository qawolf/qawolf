/**
 * Copyright (c) 2017-present, Facebook, Inc.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

const path = require('path');

module.exports = {
  title: 'QA Wolf',
  tagline: 'Create browser tests 10x faster',
  url: 'https://docs.qawolf.com',
  baseUrl: '/',
  favicon: 'img/favicon.ico',
  organizationName: 'qawolf', // Usually your GitHub org/user name.
  projectName: 'qawolf', // Usually your repo name.
  themeConfig: {
    github: {
      repo: 'qawolf/qawolf',
    },
    gitter: {
      room: 'qawolf/community',
    },
    navbar: {
      title: 'QA Wolf',
      logo: {
        alt: 'Spirit the QA Wolf',
        src: 'img/logo.png',
      },
      links: [
        { to: 'docs/what_is_qa_wolf', label: 'Get Started', position: 'left' },
        { to: 'docs/edit_a_test', label: 'Guides', position: 'left' },
        { to: 'docs/api/table_of_contents', label: 'API', position: 'left' },
      ],
    },
    footer: {
      style: 'dark',
      logo: {
        alt: 'Spirit the QA Wolf',
        src: 'img/logo_small.png',
      },
      copyright: `Copyright © ${new Date().getFullYear()} QA Wolf. Built with Docusaurus.`,
      links: [
        {
          items: [
            {
              to: 'http://eepurl.com/gM47dD',
              label: 'Subscribe to Mailing List',
            },
            {
              to: 'docs/privacy_policy',
              label: 'Privacy Policy',
            },
          ],
        },
      ],
    },
    algolia: {
      apiKey: process.env.ALGOLIA_API_KEY,
      indexName: 'qawolf',
    },
  },
  presets: [
    [
      '@docusaurus/preset-classic',
      {
        docs: {
          sidebarPath: require.resolve('./sidebars.js'),
          editUrl: 'https://github.com/qawolf/qawolf/edit/main/docs',
        },
        theme: {
          customCss: require.resolve('./src/css/custom.css'),
        },
      },
    ],
  ],
  plugins: [
    path.resolve(__dirname, './src/gitter-chat'),
    path.resolve(__dirname, './src/github-stars'),
  ],
};
