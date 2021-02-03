import { Box } from "grommet";
import { useContext, useEffect } from "react";

import { RunnerContext } from "../contexts/RunnerContext";
import { TestContext } from "../contexts/TestContext";
import { useBrowser } from "../hooks/browser";
import { Mode } from "../hooks/mode";
import Placeholder from "./Placeholder";
import Screencast from "./Screencast";
import TestVideo from "./TestVideo";
import Header from "./Header";

type Props = {
  height: number | null;
  mode: Mode;
  width: number | null;
};

export default function Canvas({ height, mode, width }: Props): JSX.Element {
  const { runner } = useContext(RunnerContext);
  const { run } = useContext(TestContext);

  const { browser, isBrowserReady } = useBrowser();

  useEffect(() => {
    runner?.setBrowserReady(isBrowserReady);
  }, [isBrowserReady, runner]);

  if (!height || !width) return null;

  const videoUrl = run?.video_url;
  const showPlaceholder = !videoUrl && !isBrowserReady;

  return (
    <>
      <Header hasVideo={!!videoUrl} />
      <Box alignSelf="center" background="darkGray">
        {showPlaceholder && (
          <Placeholder height={height} mode={mode} width={width} />
        )}
        <Screencast
          browser={browser}
          height={height}
          isVisible={!showPlaceholder && !videoUrl}
          width={width}
        />
        <TestVideo
          height={height}
          isVisible={!!videoUrl}
          width={width}
          videoUrl={videoUrl}
        />
      </Box>
    </>
  );
}
