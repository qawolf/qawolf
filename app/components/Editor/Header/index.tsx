import { Box } from "grommet";
import { useRouter } from "next/router";
import { useContext } from "react";

import { useTestTriggers } from "../../../hooks/queries";
import { timeToText } from "../../../lib/helpers";
import { routes } from "../../../lib/routes";
import { state } from "../../../lib/state";
import { copy } from "../../../theme/copy";
import { borderSize, edgeSize } from "../../../theme/theme-new";
import Button from "../../shared-new/AppButton";
import Divider from "../../shared-new/Divider";
import ArrowLeft from "../../shared-new/icons/ArrowLeft";
import Edit from "../../shared-new/icons/Edit";
import Lightning from "../../shared-new/icons/Lightning";
import StatusBadge from "../../shared-new/StatusBadge";
import Text from "../../shared-new/Text";
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
          <Button
            IconComponent={ArrowLeft}
            a11yTitle={copy.backToDashboard}
            href={routes.tests}
            margin={{ right: "xxxsmall" }}
            type="ghost"
          />
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
          {mode === "test" ? (
            <Button
              IconComponent={Lightning}
              label={hasTriggers ? copy.editTriggers : copy.addTrigger}
              onClick={handleTriggerClick}
              type="primary"
            />
          ) : (
            <Button
              IconComponent={Edit}
              href={`${routes.test}/${run?.test_id}`}
              label={copy.editTest}
              type="primary"
            />
          )}
        </Box>
      </Box>
      {!!run && <RunSummary run={run} />}
    </>
  );
}
