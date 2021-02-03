import { useContext } from "react";
import NoMobile from "../NoMobile";
import { TestContext } from "./contexts/TestContext";
import { Mode } from "./hooks/mode";
import Text from "../shared-new/Text";
import { Box } from "grommet";
import StatusBadge from "../shared-new/StatusBadge";
import TestVideo from "./Canvas/TestVideo";
import { overflowStyle } from "../../theme/theme-new";

type Props = { mode: Mode };

export default function EditorMobile({ mode }: Props) {
  const { run, test } = useContext(TestContext);

  if (mode !== "run") return <NoMobile />;

  const videoUrl = run?.video_url;

  return (
    <Box align="center" pad="small">
      <Box
        align="center"
        direction="row"
        justify="between"
        margin={{ bottom: "small" }}
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
