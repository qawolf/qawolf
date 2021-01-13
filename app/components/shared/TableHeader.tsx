import { Box, BoxProps } from "grommet";

import Text from "./Text";

type Props = {
  basis: BoxProps["basis"];
  labels: string[];
};

export default function TableHeader({ basis, labels }: Props): JSX.Element {
  const labelsHtml = labels.map((label, i) => {
    return (
      <Box basis={basis} key={i}>
        <Text color="black" size="medium" weight="bold">
          {label}
        </Text>
      </Box>
    );
  });

  return (
    <Box direction="row" flex={false}>
      {labelsHtml}
    </Box>
  );
}
