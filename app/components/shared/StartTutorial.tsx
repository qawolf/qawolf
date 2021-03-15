import { Box } from "grommet";
import { useContext } from "react";
import styled from "styled-components";

import { useCreateTestFromGuide } from "../../hooks/createTestFromGuide";
import { useWindowSize } from "../../hooks/windowSize";
import { copy } from "../../theme/copy";
import { breakpoints } from "../../theme/theme";
import { StateContext } from "../StateContext";
import { UserContext } from "../UserContext";
import Button from "./Button";

const StyledBox = styled(Box)`
  button {
    p {
      margin-top: 0;
    }
  }
`;

export default function StartTutorial(): JSX.Element {
  const { width } = useWindowSize();

  const { teamId } = useContext(StateContext);
  const { user } = useContext(UserContext);

  const { loading, onClick } = useCreateTestFromGuide({
    href: "/create-a-test",
    name: "Guide: Create a Test",
    teamId,
    userId: user?.id,
  });

  const isMobile = width && width < breakpoints.medium.value;
  if (isMobile || !teamId || !user) return null;

  return (
    <StyledBox margin={{ top: "medium" }}>
      <Button
        disabled={loading}
        label={copy.startTutorial}
        onClick={onClick}
        size="medium"
      />
    </StyledBox>
  );
}
