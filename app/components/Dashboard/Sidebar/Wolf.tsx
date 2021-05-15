import { Box } from "grommet";
import { useContext, useRef, useState } from "react";
import styled from "styled-components";

import { useOnboarding } from "../../../hooks/queries";
import { copy } from "../../../theme/copy";
import { transitionDuration } from "../../../theme/theme";
import WolfPlaying from "../../shared/icons/WolfPlaying";
import WolfSittingRight from "../../shared/icons/WolfSittingRight";
import Text from "../../shared/Text";
import { UserContext } from "../../UserContext";
import { buildIsOnboarded } from "./helpers";
import Tips from "./Tips";

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
  const { team, user, wolf } = useContext(UserContext);

  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);

  const { data } = useOnboarding({ team_id: team?.id });
  const onboarding = data?.onboarding || null;

  if (!wolf) return null;

  const isOnboarded = buildIsOnboarded(onboarding);

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

  const BoxComponent = isOnboarded ? StyledBox : Box;
  const IconComponent = isPlaying ? WolfPlaying : WolfSittingRight;

  return (
    <BoxComponent align="center" flex={false} width="full">
      {isOnboarded ? (
        <Text
          color="gray9"
          margin={{ bottom: "xxsmall" }}
          size="componentBold"
          textAlign="center"
        >
          {copy.wolfGreeting(wolf.name)}
        </Text>
      ) : (
        <Tips onboarding={onboarding} userId={user?.id} wolfName={wolf.name} />
      )}
      <Box height={height} justify="end" onClick={handleClick}>
        <IconComponent color={wolf.variant} />
      </Box>
    </BoxComponent>
  );
}
