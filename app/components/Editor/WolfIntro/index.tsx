import { Box } from "grommet";
import { useContext, useEffect, useState } from "react";

import { useSendPostHogEvent } from "../../../hooks/postHog";
import { Wolf as WolfType } from "../../../lib/types";
import { copy } from "../../../theme/copy";
import Text from "../../shared/Text";
import { StateContext } from "../../StateContext";
import Overlay from "../Overlay";
import UrlInput from "../UrlInput";
import { animateAll } from "./animations/all";
import Wolf from "./Wolf";
import WolfStats from "./WolfStats";

type Props = {
  onboardUser: () => void;
  wolf: WolfType;
};

const IMAGE_COUNT = 8;
const WIDTH = "400px";

export default function WolfIntro({ onboardUser, wolf }: Props): JSX.Element {
  useSendPostHogEvent("wolfIntro");

  const {
    image: { wolf: count },
  } = useContext(StateContext);

  const [isAnimated, setIsAnimated] = useState(false);

  useEffect(() => {
    if (!wolf || count < IMAGE_COUNT || isAnimated) return;
    setIsAnimated(true);
    // animation for blue wolf slightly different
    animateAll(wolf.variant === "blue");
  }, [count, isAnimated, wolf]);

  return (
    <Overlay>
      <Box background="black" flex={false} style={{ width: WIDTH }}>
        <Box align="center" width="full">
          <Text
            color="white"
            margin={{ bottom: "medium" }}
            size="xlarge"
            weight="bold"
          >
            {copy.meet}
          </Text>
          <WolfStats wolf={wolf} />
          <Wolf wolf={wolf} />
          <UrlInput onboardUser={onboardUser} wolfName={wolf?.name || null} />
        </Box>
      </Box>
    </Overlay>
  );
}
