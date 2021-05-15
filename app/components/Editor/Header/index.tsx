import { Box } from "grommet";
import { useRouter } from "next/router";
import { useContext, useEffect } from "react";

import { timeToText } from "../../../lib/helpers";
import { state } from "../../../lib/state";
import { copy } from "../../../theme/copy";
import { borderSize, edgeSize } from "../../../theme/theme";
import Button from "../../shared/AppButton";
import Divider from "../../shared/Divider";
import Edit from "../../shared/icons/Edit";
import StatusBadge from "../../shared/StatusBadge";
import Text from "../../shared/Text";
import { StateContext } from "../../StateContext";
import { RunnerContext } from "../contexts/RunnerContext";
import { TestContext } from "../contexts/TestContext";
import { buildTestHref } from "../helpers";
import { Mode } from "../hooks/mode";
import BackButton from "./BackButton";
import Branch from "./Branch";
import RunSummary from "./RunSummary";
import TestButtons from "./TestButtons";
import TestHistory from "./TestHistory";
import TestName from "./TestName";

type Props = { mode: Mode };

export default function Header({ mode }: Props): JSX.Element {
  const {
    query: { test_id },
  } = useRouter();

  const { progress } = useContext(RunnerContext);
  const { branch: stateBranch } = useContext(StateContext);
  const { hasChanges, run, suite, test } = useContext(TestContext);

  const branch = suite?.branch || stateBranch || null;
  const testId = test_id as string;

  // update branch to suite branch if possible
  useEffect(() => {
    if (suite?.branch) state.setBranch(suite.branch);
  }, [suite?.branch]);

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
          <Branch hasChanges={hasChanges} branch={branch} mode={mode} />
          <TestHistory testId={test?.id || null} />
          <Divider
            height={edgeSize.large}
            margin={{ horizontal: "small" }}
            width={borderSize.xsmall}
          />
          {mode === "test" && <TestButtons branch={branch} testId={testId} />}
          {run?.test_id && (
            <Button
              IconComponent={Edit}
              href={buildTestHref({ run, suite })}
              isDisabled={!run?.test_id || !!test?.deleted_at}
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
