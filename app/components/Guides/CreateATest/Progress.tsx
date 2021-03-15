import { Box } from "grommet";

import Meter from "../../shared/Meter";
import Text from "../../shared/Text";

type Props = { step: number };

const max = 4;

export default function Progress({ step }: Props): JSX.Element {
  const label = `Step ${step} of ${max}`;

  return (
    <Box align="center" alignSelf="center">
      <Meter a11yTitle="progress" max={max} value={step} />
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
