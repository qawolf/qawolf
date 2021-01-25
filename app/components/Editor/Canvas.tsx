import { Box } from "grommet";
import { useContext, useEffect, useState } from "react";
import EnvVariables from "../shared-new/EnvVariables";

import { RunnerContext } from "./contexts/RunnerContext";
import { TestContext } from "./contexts/TestContext";
import { useBrowser } from "./hooks/browser";
import { Mode } from "./hooks/mode";
import Placeholder from "./Placeholder";
import Screencast from "./Screencast";
import TestVideo from "./TestVideo";
import VideoToggle from "./VideoToggle";

type Props = {
  height: number | null;
  mode: Mode;
  width: number | null;
};

const BORDER_RADIUS = "16px";
export const BORDER_SIZE = 6;

export default function Canvas({ height, mode, width }: Props): JSX.Element {
  const { run } = useContext(TestContext);

  const [isVideoToggled, toggleVideo] = useState(mode === "run");
  const { browser, isBrowserReady } = useBrowser();

  const { runner } = useContext(RunnerContext);
  useEffect(() => {
    runner?.setBrowserReady(isBrowserReady);
  }, [isBrowserReady, runner]);

  if (!height || !width) return null;

  const videoUrl = run?.video_url;

  const showVideo = videoUrl && isVideoToggled;
  const showPlaceholder = !videoUrl && !isBrowserReady;

  return (
    <>
      <Box
        alignSelf="center"
        background="darkGray"
        border={{ color: "borderBlue", size: `${BORDER_SIZE}px` }}
        overflow="hidden"
        round={BORDER_RADIUS}
      >
        {showPlaceholder && (
          <Placeholder height={height} mode={mode} width={width} />
        )}
        <Screencast
          browser={browser}
          height={height}
          isVisible={!showPlaceholder && !showVideo}
          width={width}
        />
        <TestVideo
          height={height}
          isVisible={!showPlaceholder && showVideo}
          width={width}
          videoUrl={videoUrl}
        />
      </Box>
      <Box margin={{ top: "medium" }}>
        <EnvVariables />
      </Box>
      {!showPlaceholder && (
        <VideoToggle
          isBrowserReady={isBrowserReady}
          isVideoToggled={isVideoToggled}
          toggleVideo={toggleVideo}
          videoUrl={videoUrl}
        />
      )}
    </>
  );
}
