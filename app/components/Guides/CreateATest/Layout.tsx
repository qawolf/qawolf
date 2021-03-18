import { Box } from "grommet";
import { ReactNode } from "react";

type Props = { children: ReactNode };

export default function Layout({ children }: Props): JSX.Element {
  return (
    <Box height="100vh" overflow={{ vertical: "auto" }} width="full">
      <Box flex={false} justify="between" style={{ minHeight: "100%" }}>
        {children}
      </Box>
    </Box>
  );
}
