import { Box, BoxProps } from "grommet";
import { edgeSize } from "../../theme/theme-new";

type Props = {
  color: string;
  margin?: BoxProps["margin"];
};

const size = edgeSize.xxsmall;

export default function ColorDot({ color, margin }: Props): JSX.Element {
  return (
    <Box
      background={color}
      height={size}
      margin={margin}
      round="full"
      width={size}
    />
  );
}
