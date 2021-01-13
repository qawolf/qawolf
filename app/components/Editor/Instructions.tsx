import { Box } from "grommet";

import { Wolf } from "../../lib/types";
import WolfChill from "../shared/icons/WolfChill";
import Overlay from "./Overlay";
import UrlInput from "./UrlInput";

type Props = {
  wolf: Wolf | null;
};

const BUTTON_MARGIN = "-39px";
const WIDTH = "400px";

export default function Instructions({ wolf }: Props): JSX.Element {
  return (
    <Overlay>
      <Box align="center" width={WIDTH}>
        <WolfChill variant={wolf?.variant || null} />
        <Box fill="horizontal" margin={{ top: BUTTON_MARGIN }}>
          <UrlInput wolfName={wolf?.name || null} />
        </Box>
      </Box>
    </Overlay>
  );
}
