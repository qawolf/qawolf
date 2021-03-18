import { Box } from "grommet";
import { ReactNode } from "react";

import { edgeSize } from "../../../theme/theme";

type Props = { children: ReactNode };

export default function Layout({ children }: Props): JSX.Element {
  return (
    <Box
      align="center"
      background="gray2"
      height="100vh"
      justify="center"
      overflow={{ vertical: "auto" }}
      width="full"
    >
      <Box
        background="gray0"
        flex={false}
        overflow="hidden"
        round={edgeSize.xxsmall}
      >
        {children}
      </Box>
    </Box>
  );
}
