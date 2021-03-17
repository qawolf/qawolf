import { Box } from "grommet";

import { copy } from "../../../../theme/copy";
import BrowserElement from "../../../shared/icons/BrowserElement";
import Text from "../../../shared/Text";
import { labelProps } from "./helpers";

export default function ChooseElement(): JSX.Element {
  return (
    <Box align="center" pad="medium">
      <BrowserElement />
      <Text {...labelProps} margin={{ top: "medium" }} size="componentHeader">
        {copy.chooseElementHeader}
      </Text>
      <Text
        {...labelProps}
        margin={{ top: "xxsmall" }}
        size="componentParagraph"
        textAlign="center"
      >
        {copy.chooseElementDetail}
      </Text>
    </Box>
  );
}
