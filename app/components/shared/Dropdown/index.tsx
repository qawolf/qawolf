import { Box, BoxProps } from "grommet";
import { ReactNode } from "react";

type Props = {
  children: ReactNode;
  pad?: BoxProps["pad"];
};

export default function Dropdown({ children, pad }: Props): JSX.Element {
  return (
    <Box
      background="white"
      border={{ color: "borderGray" }}
      elevation="medium"
      overflow={{ vertical: "auto" }}
      pad={pad}
      round="small"
    >
      {children}
    </Box>
  );
}
