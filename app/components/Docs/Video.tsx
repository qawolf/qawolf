import styled from "styled-components";

import { breakpoints, edgeSize } from "../../theme/theme";

type Props = {
  tellaId?: string;
  youTubeId?: string;
};

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

export default function Video({ tellaId, youTubeId }: Props): JSX.Element {
  const src = tellaId
    ? `https://app.tella.tv/embed/${tellaId}`
    : `https://www.youtube.com/embed/${youTubeId}`;

  return (
    <StyledDiv>
      <StyledIframe allowFullScreen src={src} />
    </StyledDiv>
  );
}
