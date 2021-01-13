import { Box } from "grommet";
import { ReactNode } from "react";

type Props = {
  children: ReactNode;
};

const PAD = "56px";

export default function Overlay({ children }: Props): JSX.Element {
  return (
    <Box
      align="center"
      background={{ color: "brand", opacity: 0.4 }}
      height="full"
      justify="center"
      style={{ position: "absolute" }}
      width="full"
    >
      <Box
        align="center"
        background="black"
        pad={PAD}
        round={PAD}
        style={{ position: "relative" }}
      >
        {children}
      </Box>
    </Box>
  );
}
