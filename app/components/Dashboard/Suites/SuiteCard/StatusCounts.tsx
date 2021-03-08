import { Box } from "grommet";

import { StatusCounts as StatusCountsType } from "../../../../lib/types";
import { edgeSize } from "../../../../theme/theme-new";
import StatusSummary from "../../../shared/StatusSummary";

type Props = {
  statusCounts: StatusCountsType;
};

export default function StatusCounts({ statusCounts }: Props): JSX.Element {
  return (
    <Box align="center" direction="row" gap={edgeSize.small}>
      {!!statusCounts.fail && (
        <StatusSummary
          count={statusCounts.fail}
          size="component"
          status="fail"
        />
      )}
      {!!statusCounts.pass && (
        <StatusSummary
          count={statusCounts.pass}
          size="component"
          status="pass"
        />
      )}
      {!!statusCounts.created && (
        <StatusSummary
          count={statusCounts.created}
          size="component"
          status="created"
        />
      )}
    </Box>
  );
}
