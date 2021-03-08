import { Box } from "grommet";
import { useContext } from "react";
import styled from "styled-components";

import { isServer } from "../../../lib/detection";
import { copy } from "../../../theme/copy";
import { transitionDuration } from "../../../theme/theme";
import WolfSitting from "../../shared/icons/WolfSitting";
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

  if (isServer() || !wolf) return null;

  return (
    <StyledBox alignSelf="center" flex={false}>
      <Text
        color="gray9"
        margin={{ bottom: "xxsmall" }}
        size="componentBold"
        textAlign="center"
      >
        {copy.wolfIntro(wolf.name)}
      </Text>
      <WolfSitting color={wolf.variant} />
    </StyledBox>
  );
}
