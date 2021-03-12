import { Box } from "grommet";
import { ReactNode } from "react";

import Progress from "./Progress";

type Props = {
  children: ReactNode;
  step?: number;
};

const maxWidth = "680px";

export default function Layout({ children, step }: Props): JSX.Element {
  const showProgress = !!step;

  return (
    <Box align="center" height="100vh" justify="center">
      <Box
        height="full"
        justify={showProgress ? "between" : "center"}
        overflow={{ vertical: "auto" }}
        pad={{ vertical: "medium" }}
        style={{ maxWidth }}
      >
        <Box flex={false}>{children}</Box>
        {showProgress && <Progress step={step} />}
      </Box>
    </Box>
  );
}
