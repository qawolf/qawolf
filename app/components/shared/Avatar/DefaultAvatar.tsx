import { Box } from "grommet";

import { edgeSize } from "../../../theme/theme";
import WolfHead from "../icons/WolfHead";

type Props = {
  color: string;
  size?: string | null;
};

export default function DefaultAvatar({ color, size }: Props): JSX.Element {
  return (
    <Box
      align="center"
      background="gray2"
      data-test="avatar-default"
      fill
      justify="center"
    >
      <WolfHead color={color} width={size || edgeSize.small} />
    </Box>
  );
}
