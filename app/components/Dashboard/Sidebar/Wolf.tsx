import { Box } from "grommet";
import { useContext, useRef, useState } from "react";
import styled from "styled-components";

import { copy } from "../../../theme/copy";
import { transitionDuration } from "../../../theme/theme";
import WolfPlaying from "../../shared/icons/WolfPlaying";
import WolfSittingRight from "../../shared/icons/WolfSittingRight";
import Text from "../../shared/Text";
import { UserContext } from "../../UserContext";

const height = "134px";
const timeout = 3 * 1000;

const StyledBox = styled(Box)`
  p {
    opacity: 0;
    transition: opacity ${transitionDuration};
  }

  &:hover {
    p {
      opacity: 1;
    }
  }
`;

export default function Wolf(): JSX.Element {
  const { wolf } = useContext(UserContext);

  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  const [isPlaying, setIsPlaying] = useState(false); // TODO: update

  if (!wolf) return null;

  const handleClick = (): void => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }

    setIsPlaying(true);

    timeoutRef.current = setTimeout(() => {
      setIsPlaying(false);
      timeoutRef.current = null;
    }, timeout);
  };

  const IconComponent = isPlaying ? WolfPlaying : WolfSittingRight;

  return (
    <StyledBox alignSelf="center" flex={false} onClick={handleClick}>
      <Text
        color="gray9"
        margin={{ bottom: "xxsmall" }}
        size="componentBold"
        textAlign="center"
      >
        {copy.wolfGreeting(wolf.name)}
      </Text>
      <Box height={height} justify="end">
        <IconComponent color={wolf.variant} />
      </Box>
    </StyledBox>
  );
}
