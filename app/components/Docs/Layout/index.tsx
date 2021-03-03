import { Box, ThemeContext } from "grommet";
import { useRouter } from "next/router";
import { ReactNode, useEffect } from "react";

import { theme } from "../../../theme/theme-new";
import Content from "./Content";
import Navigation from "./Navigation";
import Sidebar from "./Sidebar";

type Props = { children: ReactNode };

const algoliaApiKey = process.env.NEXT_PUBLIC_ALGOLIA_API_KEY;

export default function Layout({ children }: Props): JSX.Element {
  const { pathname } = useRouter();

  // add algolia search
  useEffect(() => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    if (!algoliaApiKey || !(window as any).docsearch) return;

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (window as any).docsearch({
      apiKey: algoliaApiKey,
      indexName: "qawolf",
      inputSelector: "#algolia-search",
    });
  }, []);

  return (
    <ThemeContext.Extend value={theme}>
      <Box>
        <Navigation />
        <Box background="white" direction="row" width="full">
          <Sidebar pathname={pathname} />
          <Content pathname={pathname}>{children}</Content>
        </Box>
      </Box>
    </ThemeContext.Extend>
  );
}
