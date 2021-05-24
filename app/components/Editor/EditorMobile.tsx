import { Box } from "grommet";
import { useContext } from "react";

import { edgeSize, overflowStyle } from "../../theme/theme";
import NoMobile from "../NoMobile";
import StatusBadge from "../shared/StatusBadge";
import Text from "../shared/Text";
import TestVideo from "./Canvas/TestVideo";
import { EditorContext } from "./contexts/EditorContext";

export default function EditorMobile(): JSX.Element {
  const { run, runId, testPath } = useContext(EditorContext);
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
