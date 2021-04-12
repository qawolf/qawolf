import { Box, Meter as GrommetMeter } from "grommet";

import { colors } from "../../theme/theme";

type Props = {
  a11yTitle: string;
  max: number;
  value: number;
};

export default function Meter({ a11yTitle, max, value }: Props): JSX.Element {
  const values = [{ value }];

  return (
    <Box overflow="hidden" round="xlarge">
      <GrommetMeter
        a11yTitle={a11yTitle}
        background={colors.gray2}
        max={max}
        margin="0"
        size="full"
        thickness="xsmall"
        values={values}
      />
    </Box>
  );
}
