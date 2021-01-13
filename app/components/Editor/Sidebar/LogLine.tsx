import { Box, Text } from "grommet";
import { useEffect } from "react";

import { formatLogColor, formatTimestamp } from "../../../lib/helpers";
import { Log } from "../../../lib/types";

type Props = { log: Log; measure: () => void; style: React.CSSProperties };

const FONT_FAMILY = 'Monaco, "Lucida Console", monospace';
const TIMESTAMP_OPACITY = 0.64;

const textProps = {
  size: "small",
  style: { fontFamily: FONT_FAMILY },
};

export default function LogLine({ log, measure, style }: Props): JSX.Element {
  const color = formatLogColor(log.severity);

  useEffect(() => {
    // re-measure when the log changes
    measure();
  }, [log, measure]);

  return (
    <Box align="start" direction="row" flex={false} style={style}>
      <Text
        {...textProps}
        color={color}
        margin={{ left: "large", right: "medium" }}
        style={{ ...textProps.style, opacity: TIMESTAMP_OPACITY }}
      >
        {formatTimestamp(log.timestamp)}
      </Text>
      <Text
        {...textProps}
        color={color}
        margin={{ right: "large" }}
        wordBreak="break-word"
      >
        {log.message}
      </Text>
    </Box>
  );
}
