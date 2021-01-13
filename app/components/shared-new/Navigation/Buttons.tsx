import { useContext } from "react";
import styled from "styled-components";

import { routes } from "../../../lib/routes";
import { NavigationType } from "../../../lib/types";
import { copy } from "../../../theme/copy";
import { breakpoints, edgeSize } from "../../../theme/theme-new";
import { UserContext } from "../../UserContext";
import Button from "..//Button";

type Props = { type: NavigationType };

const StyledDiv = styled.div`
  display: none;

  @media screen and (min-width: ${breakpoints.small.value}px) {
    align-items: center;
    display: flex;
    flex-direction: row;
  }
`;

export default function Buttons({ type }: Props): JSX.Element {
  const { user } = useContext(UserContext);

  return (
    <StyledDiv>
      {!user && (
        <Button
          href={routes.logIn}
          margin={{
            horizontal: `calc(${edgeSize.xlarge} - ${edgeSize.xsmall})`,
          }}
          label={copy.logIn}
          size="small"
          type={type === "light" ? "invisibleLight" : "invisibleDark"}
        />
      )}
      <Button
        href={user ? routes.tests : routes.signUp}
        label={user ? copy.myTests : copy.signUp}
        margin={user ? { left: "xlarge" } : undefined}
        size="small"
      />
    </StyledDiv>
  );
}
