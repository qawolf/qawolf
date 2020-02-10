module.exports = function(context) {
  const { siteConfig } = context;
  const { themeConfig } = siteConfig;
  const { gitter } = themeConfig || {};

  if (!gitter || !gitter.room) {
    throw new Error(`You need to specify 'gitter.room' in 'themeConfig'`);
  }

  return {
    name: "gitter-chat",

    injectHtmlTags() {
      return {
        headTags: [
          {
            tagName: "script",
            innerHTML: `
            ((window.gitter = {}).chat = {}).options = {
              room: '${gitter.room}'
            };
            `
          },
          {
            tagName: "script",
            attributes: {
              async: true,
              defer: true,
              src: "https://sidecar.gitter.im/dist/sidecar.v1.js"
            }
          }
        ]
      };
    }
  };
};
