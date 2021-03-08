import { Box } from "grommet";
import Image from "next/image";
import { useState } from "react";
import styled from "styled-components";

import { breakpoints, edgeSize, offset } from "../../../../theme/theme";
import Section from "../../../shared/Section";
import PlayButton from "./PlayButton";
import Video from "./Video";

const StyledBox = styled(Box)`
  border-radius: ${edgeSize.small};
  cursor: pointer;
  margin-top: -64px;
  overflow: hidden;
  position: relative;

  &:hover {
    #play-button {
      transform: scale(1.2);
    }
  }

  @media screen and (min-width: ${breakpoints.small.value}px) {
    border-radius: ${edgeSize.medium};
    margin-top: ${offset.demoVideo};
  }
`;

export default function DemoVideo(): JSX.Element {
  const [showVideo, setShowVideo] = useState(false);

  const handleClick = (): void => setShowVideo(true);
  const handleClickOutside = (): void => setShowVideo(false);

  return (
    <>
      {showVideo && <Video onClickOutside={handleClickOutside} />}
      <Section background="transparent" noPadding>
        <StyledBox
          a11yTitle="play demo video"
          border={{ color: "fill30", size: "medium" }}
          onClick={handleClick}
        >
          <Image
            alt="QA Wolf demo video"
            height={1023}
            src="/demo_video.png"
            width={2160}
          />
          <PlayButton />
        </StyledBox>
      </Section>
    </>
  );
}
