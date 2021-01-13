import { Box, ThemeContext } from "grommet";
import { useRouter } from "next/router";
import { ReactNode } from "react";

import { theme } from "../../../theme/theme-new";
import Content from "./Content";
import Navigation from "./Navigation";
import Sidebar from "./Sidebar";

type Props = { children: ReactNode };

export default function Layout({ children }: Props): JSX.Element {
  const { pathname } = useRouter();

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
