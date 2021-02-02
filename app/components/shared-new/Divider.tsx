import { Box, BoxProps } from "grommet";

type Props = {
  height?: BoxProps["height"];
  margin?: BoxProps["margin"];
  width?: BoxProps["width"];
};

export default function Divider({ height, margin, width }: Props): JSX.Element {
  return (
    <Box
      background="gray3"
      flex={false}
      height={height || "1px"}
      margin={margin}
      width={width || "full"}
    />
  );
}
