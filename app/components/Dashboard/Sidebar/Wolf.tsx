import { Box } from "grommet";
import { useContext, useState } from "react";
import styled from "styled-components";

import { copy } from "../../../theme/copy";
import { transitionDuration } from "../../../theme/theme";
import WolfPlaying from "../../shared/icons/WolfPlaying";
import WolfSittingRight from "../../shared/icons/WolfSittingRight";
import Text from "../../shared/Text";
import { UserContext } from "../../UserContext";

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
  const [isPlaying, setIsPlaying] = useState(true); // TODO: update

  if (!wolf) return null;

  const IconComponent = isPlaying ? WolfPlaying : WolfSittingRight;

  return (
    <StyledBox alignSelf="center" flex={false}>
      <Text
        color="gray9"
        margin={{ bottom: "xxsmall" }}
        size="componentBold"
        textAlign="center"
      >
        {copy.wolfGreeting(wolf.name)}
      </Text>
      <Box height="134px" justify="end">
        <IconComponent color={wolf.variant} />
      </Box>
    </StyledBox>
  );
}
