import { Box } from "grommet";

import WolfHead from "../icons/WolfHead";

type Props = { wolfVariant: string };

const WOLF_WIDTH = "24px";

export default function DefaultAvatar({ wolfVariant }: Props): JSX.Element {
  return (
    <Box
      align="center"
      background="brand"
      data-test="avatar-default"
      fill
      justify="center"
    >
      {/* goose wolf head a bit */}
      <Box margin={{ left: "1px" }}>
        <WolfHead variant={wolfVariant} width={WOLF_WIDTH} />
      </Box>
    </Box>
  );
}
