import { Box } from "grommet";
import { useContext } from "react";

import { edgeSize, overflowStyle } from "../../theme/theme-new";
import NoMobile from "../NoMobile";
import StatusBadge from "../shared/StatusBadge";
import Text from "../shared/Text";
import TestVideo from "./Canvas/TestVideo";
import { TestContext } from "./contexts/TestContext";
import { Mode } from "./hooks/mode";

type Props = { mode: Mode };

export default function EditorMobile({ mode }: Props): JSX.Element {
  const { run, test } = useContext(TestContext);

  if (mode !== "run") return <NoMobile />;

  const videoUrl = run?.video_url;

  return (
    <Box align="center" pad="small">
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
          {test?.name || ""}
        </Text>
        <StatusBadge status={run?.status} />
      </Box>
      {!!videoUrl && <TestVideo isMobile isVisible videoUrl={videoUrl} />}
    </Box>
  );
}
