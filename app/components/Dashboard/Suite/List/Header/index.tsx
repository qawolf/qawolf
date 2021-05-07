import { Box } from "grommet";

import { Suite, SuiteRun } from "../../../../../lib/types";
import { copy } from "../../../../../theme/copy";
import { border, edgeSize } from "../../../../../theme/theme";
import CheckBox from "../../../../shared/CheckBox";
import StatusSummary from "../../../../shared/StatusSummary";
import Text from "../../../../shared/Text";
import { getRunCountForStatus } from "../../../helpers";
import RunTests from "./RunTests";

type Props = {
  checkedTestIds: string[];
  runs: SuiteRun[];
  setCheckedTestIds: (testIds: string[]) => void;
  suite: Suite;
};

export default function Header({
  checkedTestIds,
  runs,
  setCheckedTestIds,
  suite,
}: Props): JSX.Element {
  const checked =
    !!runs.length && runs.every((r) => checkedTestIds.includes(r.test_id));
  const indeterminate =
    !checked && runs.some((r) => checkedTestIds.includes(r.test_id));

  const failCount = getRunCountForStatus(runs, "fail");
  const passCount = getRunCountForStatus(runs, "pass");
  const createdCount = getRunCountForStatus(runs, "created");

  const handleClick = (): void => {
    if (checked) {
      setCheckedTestIds([]);
    } else {
      const testIds = runs.map((r) => r.test_id);
      setCheckedTestIds(testIds);
    }
  };

  return (
    <Box
      align="center"
      background="gray1"
      border={{ ...border, side: "horizontal" }}
      direction="row"
      flex={false}
      justify="between"
      pad={{ horizontal: "medium", vertical: "small" }}
    >
      <Box align="center" direction="row">
        <CheckBox
          checked={checked}
          indeterminate={indeterminate}
          onChange={handleClick}
        />
        {checkedTestIds.length ? (
          <Text color="gray9" margin={{ left: "small" }} size="componentBold">
            {copy.selected(checkedTestIds.length)}
          </Text>
        ) : (
          <Box
            align="center"
            direction="row"
            gap={edgeSize.small}
            margin={{ left: "small" }}
          >
            {!!failCount && <StatusSummary count={failCount} status="fail" />}
            {!!passCount && <StatusSummary count={passCount} status="pass" />}
            {!!createdCount && (
              <StatusSummary count={createdCount} status="created" />
            )}
            {!runs.length && <StatusSummary count={0} status={null} />}
          </Box>
        )}
      </Box>
      <RunTests runs={runs} suite={suite} testIds={checkedTestIds} />
    </Box>
  );
}
