import { Box } from "grommet";

import { Wolf as WolfType } from "../../../lib/types";
import LoadableImage from "../../shared/LoadableImage";
import Portal, { PORTAL_SIZE } from "./Portal";
import WolfIcon from "./WolfIcon";

type Props = {
  wolf: WolfType | null;
};

const SHADOW_TOP = "218px";
const SHADOW_WIDTH = "68px";

export default function Wolf({ wolf }: Props): JSX.Element {
  return (
    <Box height={PORTAL_SIZE} style={{ position: "relative" }}>
      {!!wolf && <WolfIcon wolf={wolf} />}
      <LoadableImage
        group="wolf"
        id="wolf-shadow"
        src="/wolf_shadow.png"
        style={{
          left: `calc(50% - ${SHADOW_WIDTH} / 2)`,
          opacity: 0,
          position: "absolute",
          top: SHADOW_TOP,
          zIndex: 15,
        }}
      />
      <Portal />
    </Box>
  );
}
