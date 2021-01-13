import "../theme/global.css";
import "../theme/wolf-animations.css";

import { ApolloProvider } from "@apollo/client";
import { MDXProvider } from "@mdx-js/react";
import { Grommet } from "grommet";
import { AppProps } from "next/app";
import Head from "next/head";
import React from "react";

import { components } from "../components/Docs/components";
import Modals from "../components/Modals";
import Error from "../components/shared/Error";
import { StateProvider } from "../components/StateContext";
import { UserProvider } from "../components/UserContext";
import { useBootIntercom } from "../hooks/intercom";
import { client } from "../lib/client";
import { copy } from "../theme/copy";
import { customFontLinks, theme } from "../theme/theme";

export default function App({ Component, pageProps }: AppProps): JSX.Element {
  useBootIntercom();

  const customFontHtml = customFontLinks.map((href, i) => {
    return <link as="font" crossOrigin="" href={href} key={i} rel="preload" />;
  });

  return (
    <>
      <Head>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        {customFontHtml}
        <title>{copy.qawolf}</title>
      </Head>
      <StateProvider>
        <ApolloProvider client={client}>
          <Grommet theme={theme}>
            <MDXProvider components={components}>
              <Error />
              <Modals />
              <UserProvider>
                <Component {...pageProps} />
              </UserProvider>
            </MDXProvider>
          </Grommet>
        </ApolloProvider>
      </StateProvider>
    </>
  );
}
