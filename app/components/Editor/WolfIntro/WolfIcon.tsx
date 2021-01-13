import { Box } from "grommet";

import { Wolf as WolfType } from "../../../lib/types";
import Wolf from "../../shared/icons/Wolf";

type Props = {
  wolf: WolfType;
};

export default function WolfIcon({ wolf }: Props): JSX.Element {
  return (
    <Box
      id="wolf-container"
      style={{
        position: "absolute",
        zIndex: 20,
      }}
    >
      <Wolf containerStyle={{ transform: "scale(0)" }} wolf={wolf} />
    </Box>
  );
}
