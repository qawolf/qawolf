import { Box } from "grommet";
import Link from "next/link";

import { routes } from "../../../../../lib/routes";
import { SuiteRun } from "../../../../../lib/types";
import {
  border,
  edgeSize,
  overflowStyle,
} from "../../../../../theme/theme-new";
import CheckBox from "../../../../shared-new/CheckBox";
import StatusIcon from "../../../../shared-new/StatusIcon";
import TestGif from "../../../../shared-new/TestGif";
import Text from "../../../../shared-new/Text";
import Details from "./Details";

type Props = {
  isChecked: boolean;
  noBorder?: boolean;
  onCheck: () => void;
  run: SuiteRun;
};

export default function RunCard({
  isChecked,
  noBorder,
  onCheck,
  run,
}: Props): JSX.Element {
  return (
    <Box
      align="center"
      border={noBorder ? undefined : { ...border, side: "top" }}
      direction="row"
      pad={{ left: "small" }}
    >
      <CheckBox
        a11yTitle={run.test_name}
        checked={isChecked}
        onChange={onCheck}
      />
      <Link href={`${routes.run}/${run.id}`}>
        <a style={{ marginRight: edgeSize.small, width: "100%" }}>
          <Box
            align="center"
            direction="row"
            justify="between"
            pad={{ vertical: "small" }}
          >
            <Box align="center" direction="row">
              <TestGif
                gifUrl={run.gif_url}
                isRunning={run.status === "created"}
                margin={{ horizontal: "small" }}
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
            <Details run={run} />
          </Box>
        </a>
      </Link>
    </Box>
  );
}
