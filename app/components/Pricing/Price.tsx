import { Box } from "grommet";
import isNumber from "lodash/isNumber";

import { copy } from "../../theme/copy";
import Text from "../shared/Text";

type Props = { price: number | string };

export default function Price({ price }: Props): JSX.Element {
  const formattedPrice = isNumber(price) ? `$${price}` : price;

  return (
    <Box
      align="end"
      direction="row"
      margin={{ bottom: "medium", top: "xxxsmall" }}
    >
      <Text color="textDark" size="large" weight="bold">
        {formattedPrice}
      </Text>
      {isNumber(price) && (
        <Text color="textDark" size="medium" weight="normal">
          {copy.perUserPerMonth}
        </Text>
      )}
    </Box>
  );
}
