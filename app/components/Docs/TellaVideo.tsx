import styled from "styled-components";

import { breakpoints, edgeSize } from "../../theme/theme-new";

type Props = { id: string };

const StyledDiv = styled.div`
  margin-top: ${edgeSize.small};
  overflow: hidden;
  // 16:9 aspect ratio
  padding-top: 56.25%;
  position: relative;
  width: 100%;

  @media screen and (min-width: ${breakpoints.medium.value}px) {
    margin-top: ${edgeSize.medium};
  }
`;

const StyledIframe = styled.iframe`
  border: 0;
  height: 100%;
  left: 0;
  position: absolute;
  top: 0;
  width: 100%;
`;

export default function TellaVideo({ id }: Props): JSX.Element {
  return (
    <StyledDiv>
      <StyledIframe src={`https://app.tella.tv/embed/${id}`} />
    </StyledDiv>
  );
}
