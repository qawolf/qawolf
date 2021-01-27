import { Box, ThemeContext } from "grommet";
import { ReactNode } from "react";

import { theme } from "../../theme/theme-new";
import Layer from "./Layer";

type Props = {
  children: ReactNode;
  closeModal: () => void;
};

const WIDTH = "576px";

export default function Modal({ children, closeModal }: Props): JSX.Element {
  return (
    <ThemeContext.Extend value={theme}>
      <Layer onClickOutside={closeModal} onEsc={closeModal}>
        <Box pad="medium" width={WIDTH}>
          {children}
        </Box>
      </Layer>
    </ThemeContext.Extend>
  );
}
