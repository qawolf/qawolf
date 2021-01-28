import { Box } from "grommet";
import { useContext, useEffect, useState } from "react";

import { state } from "../../lib/state";
import Environments from "../shared-new/Environments";
import { StateContext } from "../StateContext";
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
  const { runner } = useContext(RunnerContext);
  const { environmentId } = useContext(StateContext);
  const { run } = useContext(TestContext);

  const [isVideoToggled, toggleVideo] = useState(mode === "run");
  const { browser, isBrowserReady } = useBrowser();

  useEffect(() => {
    runner?.setBrowserReady(isBrowserReady);
  }, [isBrowserReady, runner]);

  if (!height || !width) return null;

  const videoUrl = run?.video_url;

  const showVideo = videoUrl && isVideoToggled;
  const showPlaceholder = !videoUrl && !isBrowserReady;

  const handleEnvironmentClick = (environmentId: string): void => {
    state.setEnvironmentId(environmentId);
  };

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
        <Environments
          onEnvironmentClick={handleEnvironmentClick}
          selectedEnvironmentId={environmentId}
        />
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
