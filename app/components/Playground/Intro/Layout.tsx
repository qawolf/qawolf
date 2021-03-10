import { Box } from "grommet";
import { ReactNode } from "react";

type Props = { children: ReactNode };

export default function Layout({ children }: Props): JSX.Element {
  return (
    <Box align="center" height="100vh" justify="center">
      <Box width="50%">{children}</Box>
    </Box>
  );
}
