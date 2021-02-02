import { Box, Button } from "grommet";
import { Share } from "grommet-icons";
import { useRouter } from "next/router";
import { useEffect, useRef, useState } from "react";

import { getShareLink } from "../../../lib/share";
import { copy } from "../../../theme/copy";
import { edgeSize, hoverTransition, iconSize } from "../../../theme/theme";
import Text from "../../shared/Text";
import styles from "./Header.module.css";

type Props = { isMobile: boolean };

const DEFAULT_MESSAGE = copy.share;
const CLEAR_MESSAGE_MS = 400;
const SHOW_MESSAGE_MS = 3000;
// subtract 5px because wolf badge is 10px larger in height
const TOP_POSITION = `calc(-${edgeSize.medium} - ${edgeSize.small} - 5px)`;

// icon padding + half of icon size is center of icon
// - half of text width to center it
const COPY_LEFT = `calc(${edgeSize.small} + (${iconSize} / 2) - (74.56px / 2))`;
const SHARE_LEFT = `calc(${edgeSize.small} + (${iconSize} / 2) - (62.61px / 2))`;

export default function ShareButton({ isMobile }: Props): JSX.Element {
  const ref = useRef<HTMLButtonElement>(null);
  const [message, setMessage] = useState(DEFAULT_MESSAGE);

  const { query } = useRouter();
  const runId = query.run_id;

  const clearMessage = () => setMessage(DEFAULT_MESSAGE);

  useEffect(() => {
    if (message === DEFAULT_MESSAGE) return;

    const timeout = setTimeout(clearMessage, SHOW_MESSAGE_MS);
    return () => clearTimeout(timeout);
  }, [message]);

  if (!runId) return null;

  const handleClick = () => {
    navigator.clipboard.writeText(getShareLink()).then(
      () => setMessage(copy.shareSuccess),
      () => setMessage(copy.shareFail)
    );
  };
  // reset message if no longer hovering
  // while leaving enough time for opacity to transition
  const handleMouseLeave = () => {
    setTimeout(clearMessage, CLEAR_MESSAGE_MS);
  };

  const color = message === copy.shareFail ? "red" : "black";
  const left = isMobile
    ? undefined
    : message === DEFAULT_MESSAGE
    ? SHARE_LEFT
    : COPY_LEFT;
  const right = isMobile ? 0 : undefined;

  return (
    <Box
      className={styles.shareButton}
      onMouseLeave={handleMouseLeave}
      style={{ position: "relative" }}
    >
      <Button data-test="share" onClick={handleClick} plain ref={ref}>
        <Box pad={{ left: "small", vertical: "small" }}>
          <Share color="black" size={iconSize} />
        </Box>
        <Text
          as="p"
          color={color}
          size="small"
          style={{
            left,
            position: "absolute",
            right,
            top: TOP_POSITION,
            transition: hoverTransition,
            whiteSpace: "nowrap",
          }}
        >
          {message}
        </Text>
      </Button>
    </Box>
  );
}
