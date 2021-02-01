import { Box, Button, TextProps } from "grommet";

import { NavigationOption } from "../../../lib/types";
import { copy } from "../../../theme/copy";
import { hoverTransition } from "../../../theme/theme";
import Text from "../../shared/Text";

type Props = {
  isSelected: boolean;
  onClick: () => void;
  option: NavigationOption;
};

const textProps = {
  size: "medium",
  weight: "bold" as TextProps["weight"],
};

export default function Option({
  isSelected,
  onClick,
  option,
}: Props): JSX.Element {
  const color = isSelected ? "white" : "fadedBlue";
  const isCode = option === "code";

  return (
    <Box style={{ position: "relative" }}>
      <Button
        a11yTitle={`show ${option}`}
        id={isCode ? "code" : undefined}
        key={option}
        margin={{ right: "medium" }}
        onClick={onClick}
        plain
      >
        <Text
          {...textProps}
          color={color}
          style={{ transition: hoverTransition }}
        >
          {copy[option]}
        </Text>
      </Button>
    </Box>
  );
}
