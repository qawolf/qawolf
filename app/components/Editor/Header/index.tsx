import { Box } from "grommet";
import { useContext } from "react";

import { timeToText } from "../../../lib/helpers";
import { copy } from "../../../theme/copy";
import { borderSize, edgeSize } from "../../../theme/theme";
import Button from "../../shared/AppButton";
import Divider from "../../shared/Divider";
import Edit from "../../shared/icons/Edit";
import StatusBadge from "../../shared/StatusBadge";
import Text from "../../shared/Text";
import { StateContext } from "../../StateContext";
import { EditorContext } from "../contexts/EditorContext";
import { RunnerContext } from "../contexts/RunnerContext";
import { buildTestHref } from "../helpers";
import BackButton from "./BackButton";
import Branch from "./Branch";
import RunSummary from "./RunSummary";
import TestButtons from "./TestButtons";
import TestHistory from "./TestHistory";
import TestName from "./TestName";

export default function Header(): JSX.Element {
  const { progress } = useContext(RunnerContext);
  const { branch: stateBranch } = useContext(StateContext);
  const { hasChanges, run, runId, suite, testId } = useContext(EditorContext);

  const branch = stateBranch || null;

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
          <TestName disabled={!!runId} />
          {!!run && (
            <Text color="gray7" margin={{ right: "small" }} size="component">
              {timeToText(run.created_at)}
            </Text>
          )}
          <StatusBadge status={run ? null : progress?.status} />
        </Box>
        <Box align="center" direction="row">
          {!!testId && <Branch hasChanges={hasChanges} branch={branch} />}
          <TestHistory testId={testId} />
          <Divider
            height={edgeSize.large}
            margin={{ horizontal: "small" }}
            width={borderSize.xsmall}
          />
          {!runId && <TestButtons branch={branch} testId={testId} />}
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
