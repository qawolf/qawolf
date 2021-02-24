import { Box } from "grommet";

import { SuiteRun } from "../../../../lib/types";
import { borderSize, edgeSize } from "../../../../theme/theme-new";
import StatusSummary from "../../../shared-new/StatusSummary";
import { getRunCountForStatus } from "../../helpers";

type Props = { runs: SuiteRun[] };

export default function Header({ runs }: Props): JSX.Element {
  const failCount = getRunCountForStatus(runs, "fail");
  const passCount = getRunCountForStatus(runs, "pass");
  const createdCount = getRunCountForStatus(runs, "created");

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
      {!!failCount && <StatusSummary count={failCount} status="fail" />}
      {!!passCount && <StatusSummary count={passCount} status="pass" />}
      {!!createdCount && (
        <StatusSummary count={createdCount} status="created" />
      )}
      {!runs.length && <StatusSummary count={0} status={null} />}
    </Box>
  );
}
