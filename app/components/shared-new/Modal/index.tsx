import { Box, BoxProps, ThemeContext } from "grommet";
import { ReactNode } from "react";

import { theme } from "../../../theme/theme-new";
import Layer from "../Layer";

type Props = {
  children: ReactNode;
  closeModal: () => void;
  width?: BoxProps["width"];
};

const defaultWidth = "480px";

export default function Modal({
  children,
  closeModal,
  width,
}: Props): JSX.Element {
  return (
    <ThemeContext.Extend value={theme}>
      <Layer
        margin={{ vertical: "xlarge" }}
        onClickOutside={closeModal}
        onEsc={closeModal}
      >
        <Box width={width || defaultWidth}>{children}</Box>
      </Layer>
    </ThemeContext.Extend>
  );
}
