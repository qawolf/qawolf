import styled from "styled-components";

import { breakpoints, edgeSize } from "../../theme/theme-new";
import Text from "../shared/Text";

type Props = {
  detail: string;
  message: string;
};

const StyledMessage = styled(Text)`
  margin-bottom: ${edgeSize.xsmall};

  @media screen and (min-width: ${breakpoints.medium.value}px) {
    margin-bottom: ${edgeSize.small};
  }
`;

const StyledDetail = styled(Text)`
  margin-bottom: ${edgeSize.xlarge};

  @media screen and (min-width: ${breakpoints.medium.value}px) {
    margin-bottom: ${edgeSize.xxxlarge};
  }
`;

export default function HeaderText({ detail, message }: Props): JSX.Element {
  return (
    <>
      <StyledMessage
        color="primaryFill"
        margin={{ bottom: "small" }}
        size="eyebrow"
      >
        {message}
      </StyledMessage>
      <StyledDetail
        color="textDark"
        size="xlarge"
        textAlign="center"
        weight="bold"
      >
        {detail}
      </StyledDetail>
    </>
  );
}
