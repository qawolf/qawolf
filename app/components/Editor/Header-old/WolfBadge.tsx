import { Box } from "grommet";

import { getBackgroundForStatus } from "../../../lib/colors";
import { RunStatus, Wolf as WolfType } from "../../../lib/types";
import Wolf from "../../shared/icons/Wolf";

type Props = {
  hideWolf?: boolean;
  status?: RunStatus | null;
  wolf: WolfType | null;
};

const BORDER_SIZE = "4px";
const SIZE = "48px";

export default function WolfBadge({
  hideWolf,
  status,
  wolf,
}: Props): JSX.Element {
  if (!wolf) return null;

  const { background, borderColor } = getBackgroundForStatus(status);

  const isBlue = wolf.variant === "blue";
  const isHusky = wolf.variant === "husky";

  const width = isBlue || isHusky ? "40px" : "36px";

  let left = "-17px";
  let top = "-24px";

  if (isBlue) {
    left = "-24px";
    top = "-20px";
  } else if (isHusky) {
    left = "-21px";
  }

  return (
    <Box
      align="center"
      background={background}
      border={{ color: borderColor, size: BORDER_SIZE }}
      height={SIZE}
      round="full"
      width={SIZE}
    >
      <Box
        background={background}
        id={hideWolf ? undefined : "wolf"}
        style={{ position: "relative" }}
      >
        {!hideWolf && (
          <Wolf
            style={{
              left,
              position: "absolute",
              top,
              width,
            }}
            wolf={wolf}
          />
        )}
      </Box>
    </Box>
  );
}
