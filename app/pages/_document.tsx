import Document, {
  DocumentContext,
  DocumentInitialProps,
  Head,
  Html,
  Main,
  NextScript,
} from "next/document";
import { ServerStyleSheet } from "styled-components";

const description =
  "QA Wolf is a tool that helps you create and run browser tests. Set up end-to-end tests in minutes without leaving the browser.";

// https://docsearch.algolia.com/docs/dropdown
const docSearchJSVersion = "2.6.3";

const intercomAppId = process.env.NEXT_PUBLIC_INTERCOM_APP_ID;
const segmentAppId = process.env.NEXT_PUBLIC_SEGMENT_APP_ID;

class MyDocument extends Document {
  // https://github.com/vercel/next.js/blob/canary/examples/with-grommet/pages/_document.js
  static async getInitialProps(
    ctx: DocumentContext
  ): Promise<DocumentInitialProps> {
    const sheet = new ServerStyleSheet();
    const originalRenderPage = ctx.renderPage;

    try {
      ctx.renderPage = () =>
        originalRenderPage({
          enhanceApp: (App) => (props) =>
            sheet.collectStyles(<App {...props} />),
        });

      const initialProps = await Document.getInitialProps(ctx);
      return {
        ...initialProps,
        styles: (
          <>
            {initialProps.styles}
            {sheet.getStyleElement()}
          </>
        ),
      };
    } finally {
      sheet.seal();
    }
  }

  render(): JSX.Element {
    return (
      <Html lang="en">
        <Head>
          <link rel="apple-touch-icon" href="/logo192.png" />
          <link rel="manifest" href="/manifest.json" />
          <link
            rel="stylesheet"
            href={`https://cdn.jsdelivr.net/npm/docsearch.js@${docSearchJSVersion}/dist/cdn/docsearch.min.css`}
          />
          <meta name="description" content={description} />
          <meta name="twitter:description" content={description} />
          {/* Segment */}
          {!!segmentAppId && (
            <script
              dangerouslySetInnerHTML={{
                __html: `
                !function(){var analytics=window.analytics=window.analytics||[];if(!analytics.initialize)if(analytics.invoked)window.console&&console.error&&console.error("Segment snippet included twice.");else{analytics.invoked=!0;analytics.methods=["trackSubmit","trackClick","trackLink","trackForm","pageview","identify","reset","group","track","ready","alias","debug","page","once","off","on","addSourceMiddleware","addIntegrationMiddleware","setAnonymousId","addDestinationMiddleware"];analytics.factory=function(e){return function(){var t=Array.prototype.slice.call(arguments);t.unshift(e);analytics.push(t);return analytics}};for(var e=0;e<analytics.methods.length;e++){var key=analytics.methods[e];analytics[key]=analytics.factory(key)}analytics.load=function(key,e){var t=document.createElement("script");t.type="text/javascript";t.async=!0;t.src="https://cdn.segment.com/analytics.js/v1/" + key + "/analytics.min.js";var n=document.getElementsByTagName("script")[0];n.parentNode.insertBefore(t,n);analytics._loadOptions=e};analytics._writeKey="${segmentAppId}";analytics.SNIPPET_VERSION="4.13.2";
                analytics.load("${segmentAppId}");
                analytics.page();
                }}();
            `,
              }}
            />
          )}
          {/* Intercom */}
          {!!intercomAppId && (
            <script
              dangerouslySetInnerHTML={{
                __html: `
                (function(){var w=window;var ic=w.Intercom;if(typeof ic==="function"){ic('reattach_activator');ic('update',w.intercomSettings);}else{var d=document;var i=function(){i.c(arguments);};i.q=[];i.c=function(args){i.q.push(args);};w.Intercom=i;var l=function(){var s=d.createElement('script');s.type='text/javascript';s.async=true;s.src='https://widget.intercom.io/widget/${intercomAppId}';var x=d.getElementsByTagName('script')[0];x.parentNode.insertBefore(s,x);};if(w.attachEvent){w.attachEvent('onload',l);}else{w.addEventListener('load',l,false);}}})();
              `,
              }}
            />
          )}
        </Head>
        <body>
          <Main />
          <NextScript />
          <script
            src={`https://cdn.jsdelivr.net/npm/docsearch.js@${docSearchJSVersion}/dist/cdn/docsearch.min.js`}
          />
        </body>
      </Html>
    );
  }
}

export default MyDocument;
