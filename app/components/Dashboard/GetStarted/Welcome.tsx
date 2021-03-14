import { Box } from "grommet";

import { copy } from "../../../theme/copy";
import WolfGuideClosed from "../../shared/icons/WolfGuideClosed";
import Text from "../../shared/Text";
import { containerProps } from "./helpers";

type Props = { wolfColor: string };

export default function Welcome({ wolfColor }: Props): JSX.Element {
  return (
    <Box {...containerProps} align="center" direction="row">
      <Box margin={{ right: "xlarge" }}>
        <Text
          color="gray9"
          margin={{ bottom: "xxsmall" }}
          size="componentXLarge"
        >
          {copy.welcome}
        </Text>
        <Text color="gray9" size="componentParagraph">
          {copy.welcomeDetail}
        </Text>
      </Box>
      <Box flex={false}>
        <WolfGuideClosed color={wolfColor} />
      </Box>
    </Box>
  );
}
