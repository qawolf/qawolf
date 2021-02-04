import { Box } from "grommet";
import { useContext } from "react";

import { routes } from "../../../lib/routes";
import { borderSize } from "../../../theme/theme-new";
import Button from "../../shared-new/AppButton";
import ArrowLeft from "../../shared-new/icons/ArrowLeft";
import StatusBadge from "../../shared-new/StatusBadge";
import { RunnerContext } from "../contexts/RunnerContext";
import { TestContext } from "../contexts/TestContext";
import { Mode } from "../hooks/mode";
import RunSummary from "./RunSummary";
import TestHistory from "./TestHistory";
import TestName from "./TestName";

type Props = { mode: Mode };

export default function Header({ mode }: Props): JSX.Element {
  const { progress } = useContext(RunnerContext);
  const { run, test } = useContext(TestContext);

  return (
    <Box
      align="center"
      border={{ color: "gray3", side: "bottom", size: borderSize.xsmall }}
      direction="row"
      flex={false}
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
        <TestName disabled={mode !== "test"} test={test} />
        {!!run && <RunSummary run={run} />}
        <StatusBadge status={run ? run.status : progress?.status} />
      </Box>
      <Box align="center" direction="row">
        <TestHistory testId={test?.id || null} />
      </Box>
    </Box>
  );
}
