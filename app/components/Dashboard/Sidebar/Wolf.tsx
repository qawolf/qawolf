import { Box } from "grommet";
import { useContext, useState } from "react";
import styled from "styled-components";

import { copy } from "../../../theme/copy";
import { transitionDuration } from "../../../theme/theme";
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
      <WolfSittingRight color={wolf.variant} />
    </StyledBox>
  );
}
