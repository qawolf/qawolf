import { Box, ThemeContext } from "grommet";
import { ReactNode } from "react";

import { copy } from "../../theme/copy";
import { theme } from "../../theme/theme-new";
import Button from "./AppButton";
import Close from "./icons/Close";
import Layer from "./Layer";
import Text from "./Text";

type Props = {
  children: ReactNode;
  closeModal: () => void;
  label: string;
};

const WIDTH = "576px";

export default function Modal({
  children,
  closeModal,
  label,
}: Props): JSX.Element {
  return (
    <ThemeContext.Extend value={theme}>
      <Layer onClickOutside={closeModal} onEsc={closeModal}>
        <Box pad="medium" width={WIDTH}>
          <Box align="center" direction="row" justify="between">
            <Text color="gray9" size="componentHeader">
              {label}
            </Text>
            <Button
              IconComponent={Close}
              a11yTitle={copy.close}
              onClick={closeModal}
              type="ghost"
            />
          </Box>
          {children}
        </Box>
      </Layer>
    </ThemeContext.Extend>
  );
}
