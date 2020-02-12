module.exports = function(context) {
  const { siteConfig } = context;
  const { themeConfig } = siteConfig;
  const { github } = themeConfig || {};

  if (!github || !github.repo) {
    throw new Error(`You need to specify 'github.repo' in 'themeConfig'`);
  }

  return {
    name: "github-stars",

    injectHtmlTags() {
      return {
        headTags: [
          {
            tagName: "script",
            innerHTML: `
            function htmlToElement(html) {
              var template = document.createElement('template');
              html = html.trim(); // Never return a text node of whitespace as the result
              template.innerHTML = html;
              return template.content.firstChild;
            }

            var starsIntervalId = setInterval(() => {
              const stars = document.querySelector(".github-wrapper");
              if (stars) return;

              const navBar = document.querySelector(".navbar__items.navbar__items--right");
              if (!navBar) return;

              var starsLink = htmlToElement('<div class="github-wrapper"><a class="github-button" href="https://github.com/${github.repo}" data-icon="octicon-star" data-size="large" data-show-count="true" aria-label="Star ${github.repo} on GitHub">Star</a></div>');
              navBar.append(starsLink);
              
              var starsScript = document.createElement('script');
              starsScript.src = "https://buttons.github.io/buttons.js";
              document.head.append(starsScript);
            }, 100);`
          }
        ]
      };
    }
  };
};
