import { Box } from "grommet";
import { ReactNode } from "react";

import Content from "../../Docs/Layout/Content";
import MailingList from "./MailingList";
import Navigation from "./Navigation";

type Props = {
  children: ReactNode;
  isJsx?: boolean;
};

const maxWidth = "680px"; // consistent with Medium

export default function Layout({ children, isJsx }: Props): JSX.Element {
  const style = isJsx ? undefined : { maxWidth };

  return (
    <Box align="center">
      <Navigation isJsx={isJsx} />
      <Box background="white" margin={{ bottom: "xlarge" }} style={style}>
        {isJsx ? children : <Content noSidebar>{children}</Content>}
        {!isJsx && <MailingList />}
      </Box>
    </Box>
  );
}
