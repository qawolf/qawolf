import { Box, ThemeContext } from "grommet";
import { theme } from "../../../theme/theme-new";

import Button from "../../shared-new/AppButton";
import Close from "../../shared-new/icons/Close";
import Layer from "../../shared-new/Layer";
import Text from "../../shared-new/Text";
import { copy } from "../../../theme/copy";
import List from "./List";

type Props = {
  closeModal: () => void;
};

const WIDTH = "576px";

export default function Environments({ closeModal }: Props): JSX.Element {
  return (
    <ThemeContext.Extend value={theme}>
      <Layer onClickOutside={closeModal} onEsc={closeModal}>
        <Box pad="medium" width={WIDTH}>
          <Box
            align="center"
            direction="row"
            justify="between"
            margin={{ bottom: "xxsmall" }}
          >
            <Text color="gray9" size="componentHeader">
              {copy.environmentsEdit}
            </Text>
            <Button
              IconComponent={Close}
              a11yTitle={copy.close}
              onClick={closeModal}
            />
          </Box>
          <Text color="gray8" size="componentParagraph">
            {copy.environmentsEditDetail}
          </Text>
          <List />
        </Box>
      </Layer>
    </ThemeContext.Extend>
  );
}
