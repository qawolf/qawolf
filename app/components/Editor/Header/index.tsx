import { Box } from "grommet";
import { useRouter } from "next/router";
import { useContext } from "react";

import { useTestTriggers } from "../../../hooks/queries";
import { timeToText } from "../../../lib/helpers";
import { state } from "../../../lib/state";
import { copy } from "../../../theme/copy";
import { borderSize, edgeSize } from "../../../theme/theme";
import Button from "../../shared/AppButton";
import Divider from "../../shared/Divider";
import Edit from "../../shared/icons/Edit";
import Lightning from "../../shared/icons/Lightning";
import StatusBadge from "../../shared/StatusBadge";
import Text from "../../shared/Text";
import { RunnerContext } from "../contexts/RunnerContext";
import { TestContext } from "../contexts/TestContext";
import { buildTestHref } from "../helpers";
import { Mode } from "../hooks/mode";
import BackButton from "./BackButton";
import RunSummary from "./RunSummary";
import TestHistory from "./TestHistory";
import TestName from "./TestName";

type Props = { mode: Mode };

export default function Header({ mode }: Props): JSX.Element {
  const {
    query: { test_id },
  } = useRouter();

  const { progress } = useContext(RunnerContext);
  const { run, suite, test } = useContext(TestContext);

  const testIds = [test_id] as string[];

  const { data: testTriggersData } = useTestTriggers({ test_ids: testIds });
  const hasTriggers = testTriggersData?.testTriggers[0]
    ? !!testTriggersData?.testTriggers[0].trigger_ids.length
    : false;

  const handleTriggerClick = (): void => {
    state.setModal({ name: "triggers", testIds });
  };

  return (
    <>
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
          <BackButton />
          <TestName disabled={mode !== "test"} test={test} />
          {!!run && (
            <Text color="gray7" margin={{ right: "small" }} size="component">
              {timeToText(run.created_at)}
            </Text>
          )}
          <StatusBadge status={run ? null : progress?.status} />
        </Box>
        <Box align="center" direction="row">
          <TestHistory testId={test?.id || null} />
          <Divider
            height={edgeSize.large}
            margin={{ horizontal: "small" }}
            width={borderSize.xsmall}
          />
          {mode === "test" && (
            <Button
              IconComponent={Lightning}
              label={hasTriggers ? copy.editTriggers : copy.addTrigger}
              onClick={handleTriggerClick}
              type="primary"
            />
          )}
          {run?.test_id && (
            <Button
              IconComponent={Edit}
              href={buildTestHref({ run, suite })}
              isDisabled={!run?.test_id}
              label={copy.editTest}
              type="primary"
            />
          )}
        </Box>
      </Box>
      {!!run && <RunSummary run={run} suite={suite} />}
    </>
  );
}
