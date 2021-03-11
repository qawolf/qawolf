import { Box, Meter } from "grommet";

import { colors } from "../../../theme/theme";
import Text from "../../shared/Text";

type Props = { step: number };

const max = 5;

export default function Progress({ step }: Props): JSX.Element {
  const values = [{ value: step }];
  const label = `Step ${step} of ${max}`;

  return (
    <Box align="center" alignSelf="center">
      <Meter
        a11yTitle="progress"
        background={colors.gray2}
        margin="0"
        max={max}
        round
        thickness="xsmall"
        values={values}
      />
      <Text
        color="gray7"
        margin={{ top: "xxsmall" }}
        size="xsmall"
        weight="normal"
      >
        {label}
      </Text>
    </Box>
  );
}
