import { Box, Button } from "grommet";
import { Icon, Play } from "grommet-icons";
import { useState } from "react";
import { IconType } from "react-icons";

import { copy } from "../../theme/copy";
import { colors, iconSize } from "../../theme/theme";
import Paw from "./icons/Paw";
import Text from "./Text";

type Props = {
  IconComponent?: Icon | IconType;
  disabled?: boolean;
  message?: string | null;
  onClick: () => void;
};

export default function PlayButton({
  IconComponent,
  disabled,
  message,
  onClick,
}: Props): JSX.Element {
  const [isHover, setIsHover] = useState(false);

  const FinalIconComponent = isHover ? Paw : IconComponent || Play;

  return (
    <Button
      a11yTitle="run test"
      disabled={disabled}
      margin={{ left: "large" }}
      onClick={onClick}
      onMouseEnter={() => setIsHover(true)}
      onMouseLeave={() => setIsHover(false)}
      plain
    >
      <Box
        align="center"
        background="white"
        direction="row"
        elevation="xsmall"
        pad={{ horizontal: "medium", vertical: "small" }}
        round="small"
      >
        <FinalIconComponent color={colors.black} size={iconSize} />
        <Text color="black" margin={{ left: "small" }} size="medium">
          {message || copy.run}
        </Text>
      </Box>
    </Button>
  );
}
