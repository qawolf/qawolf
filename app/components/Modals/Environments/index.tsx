import { Box, ThemeContext, Button } from "grommet";
import { colors, edgeSize, theme } from "../../../theme/theme-new";

import Close from "../../shared-new/icons/Close";
import Layer from "../../shared-new/Layer";
import Text from "../../shared-new/Text";
import { copy } from "../../../theme/copy";

type Props = {
  closeModal: () => void;
};

const WIDTH = "576px";

// TODO: hover effect on close button
export default function Environments({ closeModal }: Props): JSX.Element {
  return (
    <ThemeContext.Extend value={theme}>
      <Layer onClickOutside={closeModal} onEsc={closeModal}>
        <Box pad="medium" width={WIDTH}>
          <Box align="center" direction="row" justify="between">
            <Text color="gray9" size="componentHeader">
              {copy.environmentsEdit}
            </Text>
            <Button onClick={closeModal} plain>
              <Box pad="xxsmall">
                <Close color={colors.gray9} size={edgeSize.small} />
              </Box>
            </Button>
          </Box>
        </Box>
      </Layer>
    </ThemeContext.Extend>
  );
}
