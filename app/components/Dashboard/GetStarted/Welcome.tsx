import { Box } from "grommet";

import { copy } from "../../../theme/copy";
import WolfGuideClosed from "../../shared/icons/WolfGuideClosed";
import Meter from "../../shared/Meter";
import Text from "../../shared/Text";
import { containerProps } from "./helpers";

type Props = {
  completeCount: number;
  wolfColor: string;
};

const max = 4;

export default function Welcome({
  completeCount,
  wolfColor,
}: Props): JSX.Element {
  return (
    <Box
      {...containerProps}
      align="center"
      direction="row"
      margin={{ bottom: "medium" }}
      pad="medium"
    >
      <Box margin={{ right: "xxlarge" }}>
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
        <Box margin={{ top: "medium" }}>
          <Text color="gray9" margin={{ bottom: "small" }} size="componentBold">
            {copy.completeCount(completeCount)}
          </Text>
          <Meter
            a11yTitle="onboarding progress"
            max={max}
            value={completeCount}
          />
        </Box>
      </Box>
      <Box flex={false}>
        <WolfGuideClosed color={wolfColor} />
      </Box>
    </Box>
  );
}
