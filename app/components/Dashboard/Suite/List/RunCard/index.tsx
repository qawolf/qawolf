import { Box } from "grommet";
import Link from "next/link";

import { routes } from "../../../../../lib/routes";
import { SuiteRun } from "../../../../../lib/types";
import { borderSize, overflowStyle } from "../../../../../theme/theme-new";
import StatusIcon from "../../../../shared-new/StatusIcon";
import TestGif from "../../../../shared-new/TestGif";
import Text from "../../../../shared-new/Text";

type Props = {
  noBorder?: boolean;
  run: SuiteRun;
};

export default function RunCard({ noBorder, run }: Props): JSX.Element {
  return (
    <Link href={`${routes.run}/${run.id}`}>
      <a>
        <Box
          align="center"
          border={
            noBorder
              ? undefined
              : { color: "gray3", side: "top", size: borderSize.xsmall }
          }
          direction="row"
          justify="between"
          pad="small"
        >
          <Box align="center" direction="row">
            <TestGif
              gifUrl={run.gif_url}
              isRunning={run.status === "created"}
              margin={{ right: "small" }}
              testName={run.test_name}
            />
            <StatusIcon status={run.status} />
            <Text
              color="gray9"
              margin={{ left: "small" }}
              size="componentBold"
              style={overflowStyle}
            >
              {run.test_name}
            </Text>
          </Box>
        </Box>
      </a>
    </Link>
  );
}
