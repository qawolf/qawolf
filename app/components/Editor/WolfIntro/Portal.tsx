import { useState } from "react";

import LoadableImage from "../../shared/LoadableImage";
import Ramp from "./Ramp";
import Swirl from "./Swirl";

const HALF_TRIANGLE_WIDTH = "18px";
export const PORTAL_SIZE = "256px";
const TRIANGLE_TOP = "24px";
const TRIANGLE_WIDTH = "36px";

export default function Portal(): JSX.Element {
  const [isLoaded, setIsLoaded] = useState(false);
  const display = isLoaded ? undefined : "none";

  return (
    <>
      <LoadableImage
        group="wolf"
        src="/indicator.png"
        style={{
          display,
          left: `calc(50% - ${HALF_TRIANGLE_WIDTH})`,
          position: "absolute",
          top: TRIANGLE_TOP,
          zIndex: 10,
        }}
        width={TRIANGLE_WIDTH}
      />
      <LoadableImage
        callback={() => setIsLoaded(true)}
        group="wolf"
        id="portal"
        src="/portal_body.png"
        style={{
          display,
          height: PORTAL_SIZE,
          width: PORTAL_SIZE,
        }}
      />
      <Ramp />
      <Swirl index={1} />
      <Swirl index={2} />
      <Swirl index={3} />
    </>
  );
}
