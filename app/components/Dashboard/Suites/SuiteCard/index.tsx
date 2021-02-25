import { Box } from "grommet";
import Link from "next/link";

import { timestampToText } from "../../../../lib/helpers";
import { routes } from "../../../../lib/routes";
import { SuiteSummary } from "../../../../lib/types";
import { copy } from "../../../../theme/copy";
import { border, edgeSize } from "../../../../theme/theme-new";
import ColorDot from "../../../shared-new/ColorDot";
import StatusIcon from "../../../shared-new/StatusIcon";
import Text from "../../../shared-new/Text";
import { getStatusForSuite } from "../../helpers";
import StatusCounts from "./StatusCounts";

type Props = { suite: SuiteSummary };

export default function SuiteCard({ suite }: Props): JSX.Element {
  const status = getStatusForSuite(suite);
  const timestamp = timestampToText(suite.created_at);

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
                {!!suite.trigger_color && (
                  <ColorDot
                    color={suite.trigger_color}
                    margin={{ right: "xxsmall" }}
                  />
                )}
                <Text color="gray9" size="componentBold">
                  {suite.trigger_name || copy.manuallyTriggered}
                </Text>
              </Box>
              <Text color="gray7" margin={{ top: "xxxsmall" }} size="component">
                {timestamp}
              </Text>
            </Box>
          </Box>
          <StatusCounts statusCounts={suite.status_counts} />
        </Box>
      </a>
    </Link>
  );
}
