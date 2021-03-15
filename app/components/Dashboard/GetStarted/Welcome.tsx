import { Box } from "grommet";

import { copy } from "../../../theme/copy";
import WolfGuideClosed from "../../shared/icons/WolfGuideClosed";
import WolfGuideOpen from "../../shared/icons/WolfGuideOpen";
import Meter from "../../shared/Meter";
import Text from "../../shared/Text";
import { containerProps } from "./helpers";

type Props = {
  completeCount: number;
  isOpen: boolean;
  wolfColor: string;
};

const max = 4;
const minWolfWidth = "144px";

export default function Welcome({
  completeCount,
  isOpen,
  wolfColor,
}: Props): JSX.Element {
  const WolfIconComponent = isOpen ? WolfGuideOpen : WolfGuideClosed;

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
      <Box flex={false} style={{ minWidth: minWolfWidth }}>
        {!!wolfColor && <WolfIconComponent color={wolfColor} />}
      </Box>
    </Box>
  );
}
