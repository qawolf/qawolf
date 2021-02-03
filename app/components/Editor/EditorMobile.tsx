import { useContext } from "react";
import NoMobile from "../NoMobile";
import { TestContext } from "./contexts/TestContext";
import { Mode } from "./hooks/mode";
import Text from "../shared-new/Text";
import { Box } from "grommet";
import StatusBadge from "../shared-new/StatusBadge";
import TestVideo from "./Canvas/TestVideo";

type Props = { mode: Mode };

export default function EditorMobile({ mode }: Props) {
  const { run, test } = useContext(TestContext);

  if (mode !== "run") return <NoMobile />;

  const videoUrl = run?.video_url;

  return (
    <Box>
      <Text color="gray9" size="componentHeader">
        {test?.name || ""}
      </Text>
      <StatusBadge status={run?.status} />
      {!!videoUrl && <TestVideo isMobile isVisible videoUrl={videoUrl} />}
    </Box>
  );
}
