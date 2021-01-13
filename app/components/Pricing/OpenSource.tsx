import { Box } from "grommet";

import { copy } from "../../theme/copy";
import { colors } from "../../theme/theme-new";
import Button from "../shared-new/Button";
import Text from "../shared-new/Text";

const href = "mailto:hello@qawolf.com";

export default function OpenSource(): JSX.Element {
  return (
    <Box
      align="center"
      background="fill0"
      margin={{ top: "80px" }}
      pad={{ horizontal: "medium", vertical: "xlarge" }}
      round="xsmall"
      width="full"
    >
      <Text
        color="textDark"
        margin={{ bottom: "xxsmall" }}
        size="large"
        textAlign="center"
        weight="bold"
      >
        {copy.loveOpenSource}
      </Text>
      <Text color="textLight" size="small" textAlign="center" weight="normal">
        {copy.openSourceDiscount}
      </Text>
      <Button
        borderColor={colors.fill30}
        href={href}
        label={copy.getInTouch}
        margin={{ top: "medium" }}
        size="medium"
        type="outlineDark"
      />
    </Box>
  );
}
