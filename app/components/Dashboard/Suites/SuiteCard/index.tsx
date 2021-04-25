import { Box } from "grommet";
import Link from "next/link";

import { routes } from "../../../../lib/routes";
import { SuiteSummary } from "../../../../lib/types";
import { border, edgeSize } from "../../../../theme/theme";
import StatusIcon from "../../../shared/StatusIcon";
import SuiteDetails from "../../../shared/SuiteDetails";
import Text from "../../../shared/Text";
import TriggerIcon from "../../../shared/TriggerIcon";
import { formatSuiteName, getStatusForSuite } from "../../helpers";
import StatusCounts from "./StatusCounts";

type Props = { suite: SuiteSummary };

export default function SuiteCard({ suite }: Props): JSX.Element {
  const status = getStatusForSuite(suite);

  const label = formatSuiteName(suite);

  return (
    <Link href={`${routes.suites}/${suite.id}`}>
      <a>
        <Box
          align="center"
          border={{ ...border, side: "bottom" }}
          direction="row"
          pad="medium"
          justify="between"
        >
          <Box align="center" direction="row">
            <StatusIcon status={status} width={edgeSize.large} />
            <Box margin={{ left: "small" }}>
              <Box align="center" direction="row">
                <TriggerIcon trigger={suite.trigger} />
                <Text color="gray9" size="componentBold">
                  {label}
                </Text>
              </Box>
              <SuiteDetails margin={{ top: "xxsmall" }} suite={suite} />
            </Box>
          </Box>
          <StatusCounts statusCounts={suite.status_counts} />
        </Box>
      </a>
    </Link>
  );
}
