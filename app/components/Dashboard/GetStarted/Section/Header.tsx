import { Box, Button } from "grommet";

import { colors, edgeSize } from "../../../../theme/theme";
import ArrowDown from "../../../shared/icons/ArrowDown";
import ArrowUp from "../../../shared/icons/ArrowUp";
import Check from "../../../shared/icons/Check";
import Text from "../../../shared/Text";
import { labels,Section } from "../helpers";

type Props = {
  isComplete: boolean;
  isOpen: boolean;
  onClick: (section: Section) => void;
  section: Section;
};

const iconSize = edgeSize.medium;

export default function Header({
  isComplete,
  isOpen,
  onClick,
  section,
}: Props): JSX.Element {
  const IconComponent = isOpen ? ArrowUp : ArrowDown;

  const handleClick = (): void => onClick(section);
  const label = labels[section];

  return (
    <Button a11yTitle={label} onClick={handleClick} plain>
      <Box
        align="center"
        direction="row"
        justify="between"
        pad={{
          bottom: isOpen ? "small" : "medium",
          horizontal: "medium",
          top: "medium",
        }}
      >
        <Box align="center" direction="row">
          <Box
            align="center"
            background={isComplete ? "success5" : "gray2"}
            height={iconSize}
            justify="center"
            round="full"
            width={iconSize}
          >
            <Check color={colors.gray0} size={iconSize} />
          </Box>
          <Text
            color="gray9"
            margin={{ left: "xsmall" }}
            size="componentHeader"
          >
            {label}
          </Text>
        </Box>
        <IconComponent color={colors.gray9} size={iconSize} />
      </Box>
    </Button>
  );
}
