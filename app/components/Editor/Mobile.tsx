import { Box } from "grommet";
import { useContext } from "react";

import { TestContext } from "./contexts/TestContext";
import { Mode } from "./hooks/mode";
import Placeholder from "./Placeholder";
import TestVideo from "./TestVideo";

type Props = {
  mode: Mode;
};

export default function Mobile({ mode }: Props): JSX.Element {
  const { run } = useContext(TestContext);

  const videoUrl = run?.video_url;
  const showPlaceholder = !videoUrl;

  return (
    <Box
      border={{ color: "borderBlue", size: "small" }}
      margin={{ horizontal: "large" }}
      overflow="hidden"
      round="small"
    >
      {showPlaceholder && <Placeholder mode={mode} />}
      <TestVideo isMobile isVisible={!showPlaceholder} videoUrl={videoUrl} />
    </Box>
  );
}
