import { Box } from "grommet";

import { edgeSize } from "../../../theme/theme-new";
import WolfHead from "../icons/WolfHead";

type Props = { color: string };

export default function DefaultAvatar({ color }: Props): JSX.Element {
  return (
    <Box
      align="center"
      background="gray2"
      data-test="avatar-default"
      fill
      justify="center"
    >
      <WolfHead color={color} width={edgeSize.small} />
    </Box>
  );
}
