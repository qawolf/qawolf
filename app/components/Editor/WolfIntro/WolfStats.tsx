import { Box } from "grommet";

import { Wolf } from "../../../lib/types";
import { copy } from "../../../theme/copy";
import { hoverTransition } from "../../../theme/theme";
import Text from "../../shared/Text";

type Props = {
  wolf: Wolf | null;
};

export default function WolfStats({ wolf }: Props): JSX.Element {
  const wolfName = wolf ? wolf.name : "Spirit";
  const wolfNumber = wolf ? wolf.number : 11;

  return (
    <Box
      align="baseline"
      direction="row"
      style={{ opacity: wolf ? 1 : 0, transition: hoverTransition }}
    >
      <Text color="brand" size="medium">{`#QAW${wolfNumber}`}</Text>
      <Text
        color="brand"
        margin={{ horizontal: "small" }}
        size="medium"
        style={{ opacity: 0.48 }}
      >
        {copy.aka}
      </Text>
      <Text color="brand" size="medium" weight="bold">
        {wolfName}
      </Text>
    </Box>
  );
}
