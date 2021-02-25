import { Box } from "grommet";

import { SuiteRun } from "../../../../lib/types";
import { copy } from "../../../../theme/copy";
import { borderSize, edgeSize } from "../../../../theme/theme-new";
import CheckBox from "../../../shared-new/CheckBox";
import StatusSummary from "../../../shared-new/StatusSummary";
import Text from "../../../shared-new/Text";
import { getRunCountForStatus } from "../../helpers";

type Props = {
  checkedTestIds: string[];
  runs: SuiteRun[];
  setCheckedTestIds: (testIds: string[]) => void;
};

export default function Header({
  checkedTestIds,
  runs,
  setCheckedTestIds,
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
      border={
        runs.length
          ? { color: "gray3", side: "bottom", size: borderSize.xsmall }
          : undefined
      }
      direction="row"
      flex={false}
      gap={edgeSize.small}
      pad="small"
    >
      <CheckBox
        checked={checked}
        indeterminate={indeterminate}
        onChange={handleClick}
      />
      {checkedTestIds.length ? (
        <Text color="gray9" size="componentBold">
          {copy.selected(checkedTestIds.length)}
        </Text>
      ) : (
        <>
          {!!failCount && <StatusSummary count={failCount} status="fail" />}
          {!!passCount && <StatusSummary count={passCount} status="pass" />}
          {!!createdCount && (
            <StatusSummary count={createdCount} status="created" />
          )}
          {!runs.length && <StatusSummary count={0} status={null} />}
        </>
      )}
    </Box>
  );
}
