import { Box } from "grommet";

import WolfHead from "../../shared-new/icons/WolfHead";

type Props = { wolfVariant: string };

export default function DefaultAvatar({ wolfVariant }: Props): JSX.Element {
  return (
    <Box
      align="center"
      background="brand"
      data-test="avatar-default"
      fill
      justify="center"
    >
      <WolfHead color={wolfVariant} width="24px" />
    </Box>
  );
}
