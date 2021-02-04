import { Box } from "grommet";

import { Wolf } from "../../lib/types";
import WolfChill from "../shared/icons/WolfChill";
import Overlay from "./Overlay";
import UrlInput from "./UrlInput";

type Props = {
  onboardUser: () => void;
  wolf: Wolf | null;
};

const BUTTON_MARGIN = "-39px";
const WIDTH = "400px";

export default function Instructions({
  onboardUser,
  wolf,
}: Props): JSX.Element {
  return (
    <Overlay>
      <Box align="center" width={WIDTH}>
        <WolfChill variant={wolf?.variant || null} />
        <Box fill="horizontal" margin={{ top: BUTTON_MARGIN }}>
          <UrlInput onboardUser={onboardUser} wolfName={wolf?.name || null} />
        </Box>
      </Box>
    </Overlay>
  );
}
