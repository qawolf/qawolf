import { Box } from "grommet";
import { useRouter } from "next/router";
import { useContext } from "react";
import styled from "styled-components";

import { CreateTestData, useCreateTest } from "../../hooks/mutations";
import { useWindowSize } from "../../hooks/windowSize";
import { routes } from "../../lib/routes";
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
  const { push } = useRouter();
  const { width } = useWindowSize();

  const { teamId } = useContext(StateContext);
  const { user } = useContext(UserContext);

  const [createTest, { loading }] = useCreateTest(
    ({ createTest }: CreateTestData): void => {
      push(`${routes.test}/${createTest.id}`);
    }
  );

  const isMobile = width && width < breakpoints.medium.value;
  if (isMobile || !teamId || !user) return null;

  const handleClick = (): void => {
    createTest({
      variables: {
        name: "Guides: Create a Test",
        team_id: teamId,
        url: `${window.location.origin}${routes.guides}/create-a-test?user_id=${user.id}`,
      },
    });
  };

  return (
    <StyledBox margin={{ top: "medium" }}>
      <Button
        disabled={loading}
        label={copy.startTutorial}
        onClick={handleClick}
        size="medium"
      />
    </StyledBox>
  );
}
