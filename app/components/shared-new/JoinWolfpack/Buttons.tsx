import { Box } from "grommet";
import styled from "styled-components";

import { routes } from "../../../lib/routes";
import { copy } from "../../../theme/copy";
import { breakpoints, edgeSize } from "../../../theme/theme-new";
import Button from "../Button";

const calendlyHref = "https://calendly.com/qawolf/30min";

export const handleScheduleClick = (): void => {
  window.open(calendlyHref, "_blank");
};

const StyledBox = styled(Box)`
  flex-direction: column;

  @media screen and (min-width: ${breakpoints.small.value}px) {
    flex-direction: row;
  }
`;

const StyledButton = styled(Button)`
  margin-top: ${edgeSize.medium};

  @media screen and (min-width: ${breakpoints.small.value}px) {
    margin-top: 0;
    margin-left: ${edgeSize.xlarge};
  }
`;

export default function Buttons(): JSX.Element {
  return (
    <StyledBox align="center" margin={{ vertical: "xlarge" }}>
      <Button href={routes.signUp} label={copy.startTesting} size="large" />
      <StyledButton
        label={copy.scheduleOnboarding}
        onClick={handleScheduleClick}
        size="large"
        type="outlineLight"
      />
    </StyledBox>
  );
}
