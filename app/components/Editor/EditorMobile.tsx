import { Box } from "grommet";
import { useContext } from "react";

import { edgeSize, overflowStyle } from "../../theme/theme";
import NoMobile from "../NoMobile";
import StatusBadge from "../shared/StatusBadge";
import Text from "../shared/Text";
import TestVideo from "./Canvas/TestVideo";
import { EditorContext } from "./contexts/EditorContext";
import { RunContext } from "./contexts/RunContext";

export default function EditorMobile(): JSX.Element {
  const { runId, testPath } = useContext(EditorContext);
  const { run } = useContext(RunContext);

  if (!runId) return <NoMobile />;

  const videoUrl = run?.video_url;

  return (
    <Box align="center" data-hj-suppress pad="small">
      <Box
        align="center"
        direction="row"
        justify="between"
        margin={{ bottom: edgeSize.small }}
        width="full"
      >
        <Text
          color="gray9"
          margin={{ right: "small" }}
          size="componentHeader"
          style={overflowStyle}
        >
          {testPath || ""}
        </Text>
        <StatusBadge status={run?.status} />
      </Box>
      {!!videoUrl && <TestVideo isMobile isVisible videoUrl={videoUrl} />}
    </Box>
  );
}
