import { Box } from "grommet";
import { useContext, useEffect } from "react";

import { RunnerContext } from "../contexts/RunnerContext";
import { useBrowser } from "../hooks/browser";
import Placeholder from "./Placeholder";
import Screencast from "./Screencast";
import TestVideo from "./TestVideo";

type Props = {
  height: number | null;
  videoUrl?: string;
  width: number | null;
};

export default function Canvas({
  height,
  videoUrl,
  width,
}: Props): JSX.Element {
  const { runner } = useContext(RunnerContext);
  const { browser, isBrowserReady } = useBrowser();

  useEffect(() => {
    runner?.setBrowserReady(isBrowserReady);
  }, [isBrowserReady, runner]);

  if (!height || !width) return null;

  const showPlaceholder = !videoUrl && !isBrowserReady;

  return (
    <>
      <Box alignSelf="center" background="gray9">
        {showPlaceholder && <Placeholder height={height} width={width} />}
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
