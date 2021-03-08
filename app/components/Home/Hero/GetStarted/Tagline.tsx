import { Box, BoxProps } from "grommet";
import styled from "styled-components";

import { routes } from "../../../../lib/routes";
import { copy } from "../../../../theme/copy";
import { breakpoints, edgeSize } from "../../../../theme/theme-new";
import Button from "../../../shared/Button";
import Text from "../../../shared/Text";

type Props = { basis: BoxProps["basis"] };

const StyledBox = styled(Box)`
  align-items: center;
  text-align: center;

  @media screen and (min-width: ${breakpoints.small.value}px) {
    align-items: start;
    padding-right: calc(${edgeSize.xlarge} / 2);
    text-align: start;
  }
`;

const StyledTagline = styled(Text)`
  margin-bottom: ${edgeSize.small};

  @media screen and (min-width: ${breakpoints.small.value}px) {
    margin-bottom: ${edgeSize.medium};
  }
`;

const StyledDetail = styled(Text)`
  margin-bottom: ${edgeSize.large};

  @media screen and (min-width: ${breakpoints.small.value}px) {
    margin-bottom: ${edgeSize.xlarge};
  }
`;

export default function Tagline({ basis }: Props): JSX.Element {
  return (
    <StyledBox basis={basis}>
      <StyledTagline color="white" size="xxlarge" weight="bold">
        {copy.shipConfidently}
      </StyledTagline>
      <StyledDetail color="primaryTextLight" size="medium" weight="normal">
        {copy.discoverBugs}
      </StyledDetail>
      <Button href={routes.signUp} label={copy.startTesting} size="large" />
    </StyledBox>
  );
}
