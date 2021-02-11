import { Box } from "grommet";
import { Trigger } from "grommet-icons";
import { useRouter } from "next/router";
import { useContext } from "react";
import { useTestTriggers } from "../../../hooks/queries";

import { routes } from "../../../lib/routes";
import { state } from "../../../lib/state";
import { copy } from "../../../theme/copy";
import { borderSize, edgeSize } from "../../../theme/theme-new";
import Button from "../../shared-new/AppButton";
import Divider from "../../shared-new/Divider";
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
  const {
    query: { test_id },
  } = useRouter();

  const { progress } = useContext(RunnerContext);
  const { run, test } = useContext(TestContext);

  const testIds = [test_id] as string[];

  const { data: testTriggersData } = useTestTriggers({ test_ids: testIds });
  const testTriggers = JSON.parse(testTriggersData?.testTriggers || "{}");

  const handleTriggerClick = (): void => {
    state.setModal({ name: "triggers", testIds, testTriggers });
  };

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
          a11yTitle={copy.backToDashboard}
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
        {mode === "test" && (
          <>
            <Divider
              height={edgeSize.large}
              margin={{ horizontal: "small" }}
              width={borderSize.xsmall}
            />
            <Button
              IconComponent={Trigger}
              label={
                testTriggers[test?.id]?.length > 1
                  ? copy.editTriggers
                  : copy.addTrigger
              }
              onClick={handleTriggerClick}
              type="primary"
            />
          </>
        )}
      </Box>
    </Box>
  );
}
