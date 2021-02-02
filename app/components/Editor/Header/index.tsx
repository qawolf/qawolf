import { Box } from "grommet";
import { useContext } from "react";

import { routes } from "../../../lib/routes";
import { borderSize } from "../../../theme/theme-new";
import Button from "../../shared-new/AppButton";
import ArrowLeft from "../../shared-new/icons/ArrowLeft";
import { RunnerContext } from "../contexts/RunnerContext";
import TestName from "./TestName";
import StatusBadge from "../../shared-new/StatusBadge";
import { TestContext } from "../contexts/TestContext";
import TestHistory from "./TestHistory";

export default function Header(): JSX.Element {
  const { progress } = useContext(RunnerContext);
  const { run, test } = useContext(TestContext);

  return (
    <Box
      align="center"
      border={{ color: "gray3", side: "bottom", size: borderSize.xsmall }}
      direction="row"
      justify="between"
      pad="small"
      width="full"
    >
      <Box align="center" direction="row">
        <Button
          IconComponent={ArrowLeft}
          href={routes.tests}
          margin={{ right: "xxxsmall" }}
          type="ghost"
        />
        <TestName disabled={!!run} test={test} />
        <StatusBadge status={progress?.status} />
      </Box>
      <TestHistory />
    </Box>
  );
}
