import { Box } from "grommet";
import Link from "next/link";

import { routes } from "../../../../../lib/routes";
import { SuiteRun } from "../../../../../lib/types";
import {
  border,
  colors,
  edgeSize,
  overflowStyle,
} from "../../../../../theme/theme";
import CheckBox from "../../../../shared/CheckBox";
import Trash from "../../../../shared/icons/Trash";
import StatusIcon from "../../../../shared/StatusIcon";
import TestGif from "../../../../shared/TestGif";
import Text from "../../../../shared/Text";
import Details from "./Details";

type Props = {
  isChecked: boolean;
  onCheck: () => void;
  run: SuiteRun;
};

const horizontalPad = "medium";

export default function RunCard({
  isChecked,
  onCheck,
  run,
}: Props): JSX.Element {
  return (
    <Box
      align="center"
      background={run.is_test_deleted ? "gray1" : "gray0"}
      border={{ ...border, side: "bottom" }}
      direction="row"
      pad={{ left: horizontalPad }}
    >
      <CheckBox
        a11yTitle={run.test_name}
        checked={isChecked}
        disabled={run.is_test_deleted}
        onChange={onCheck}
      />
      <Link href={`${routes.run}/${run.id}`}>
        <a style={{ marginLeft: edgeSize.small, width: "100%" }}>
          <Box
            align="center"
            direction="row"
            justify="between"
            margin={{ right: horizontalPad }}
            pad={{ vertical: "small" }}
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
              {run.is_test_deleted && (
                <Box margin={{ left: "xxsmall" }}>
                  <Trash color={colors.gray7} size={edgeSize.small} />
                </Box>
              )}
            </Box>
            <Details run={run} />
          </Box>
        </a>
      </Link>
    </Box>
  );
}
