import { Box, BoxProps, ThemeContext } from "grommet";
import { ReactNode } from "react";

import { theme } from "../../../theme/theme-new";
import Layer from "../Layer";

type Props = {
  a11yTitle?: string;
  children: ReactNode;
  closeModal: () => void;
  width?: BoxProps["width"];
};

const defaultWidth = "480px";

export default function Modal({
  a11yTitle,
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
        <Box a11yTitle={a11yTitle} width={width || defaultWidth}>
          {children}
        </Box>
      </Layer>
    </ThemeContext.Extend>
  );
}
