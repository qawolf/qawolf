import { Box } from "grommet";
import styled from "styled-components";

import { breakpoints } from "../../../../theme/theme";
import Layer from "../../../shared/Layer";

type Props = { onClickOutside: () => void };

const StyledBox = styled(Box)`
  // 16:9 aspect ratio
  height: 50.625vw;
  overflow: hidden;
  position: relative;
  width: 90vw;

  @media screen and (min-width: ${breakpoints.small.value}px) {
    height: 45vw;
    width: 80vw;
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

export default function Video({ onClickOutside }: Props): JSX.Element {
  return (
    <Layer onClickOutside={onClickOutside} onEsc={onClickOutside}>
      <StyledBox>
        <StyledIframe
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
          src="https://www.youtube.com/embed/q4_kSEh2O7o?autoplay=1"
        />
      </StyledBox>
    </Layer>
  );
}
