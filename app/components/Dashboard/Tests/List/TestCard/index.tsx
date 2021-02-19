import { Box } from "grommet";

import { ShortTest } from "../../../../../lib/types";
import { borderSize } from "../../../../../theme/theme-new";
import Text from "../../../../shared-new/Text";

type Props = {
  noBorder?: boolean;
  test: ShortTest;
};

export default function TestCard({ noBorder, test }: Props): JSX.Element {
  return (
    <Box
      border={
        noBorder
          ? undefined
          : { color: "gray3", side: "top", size: borderSize.xsmall }
      }
      pad="small"
    >
      <Box>
        <Text color="gray9" size="componentMedium">
          {test.name}
        </Text>
      </Box>
    </Box>
  );
}
