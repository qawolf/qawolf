import { Box, CheckBox } from "grommet";
import { Cycle, EmptyCircle } from "grommet-icons";

import { copy } from "../../../../theme/copy";
import { colors, iconSize } from "../../../../theme/theme";
import Text from "../../../shared/Text";
import { HEIGHT } from "./TestGif";

type Props = {
  hasSearch: boolean;
  isLoading: boolean;
};

export default function ListEmpty({
  hasSearch,
  isLoading,
}: Props): JSX.Element {
  const IconComponent = isLoading ? Cycle : EmptyCircle;

  let message = copy.emptyTests;
  if (isLoading) {
    message = copy.loading;
  } else if (hasSearch) {
    message = copy.emptyTestsSearch;
  }

  return (
    <Box direction="row">
      <CheckBox checked={false} />
      <Box
        align="center"
        border={{ color: "fadedBlue", style: "dashed" }}
        direction="row"
        height={HEIGHT}
        justify="center"
        margin={{ left: "medium" }}
        round="small"
        width="full"
      >
        <IconComponent color={colors.fadedBlue} size={iconSize} />
        <Text color="fadedBlue" margin={{ left: "small" }} size="medium">
          {message}
        </Text>
      </Box>
    </Box>
  );
}
