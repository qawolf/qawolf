import { Box, BoxProps } from "grommet";

const height = "1px";

type Props = { margin?: BoxProps["margin"] };

export default function Divider({ margin }: Props): JSX.Element {
  return (
    <Box
      background="gray3"
      flex={false}
      height={height}
      margin={margin}
      width="full"
    />
  );
}
