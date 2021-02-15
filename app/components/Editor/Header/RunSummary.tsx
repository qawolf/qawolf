import { Box } from "grommet";

import { durationToText, timeToText } from "../../../lib/helpers";
import { Run } from "../../../lib/types";
import { copy } from "../../../theme/copy";
import { borderSize } from "../../../theme/theme-new";
import Text from "../../shared-new/Text";
import LabeledBox from "../../shared-new/LabeledBox";

type Props = { run: Run };

const textProps = {
  color: "gray9",
  size: "component" as const,
};

export default function RunSummary({ run }: Props): JSX.Element {
  return (
    <Box
      border={{ color: "gray3", side: "bottom", size: borderSize.xsmall }}
      pad="small"
    >
      <LabeledBox label={copy.trigger}>
        <></>
      </LabeledBox>
    </Box>
  );
}
