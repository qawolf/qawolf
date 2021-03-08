import { Box, Text, TextProps } from "grommet";
import { CSSProperties, useEffect } from "react";

import {
  formatLogBackground,
  formatLogBorder,
  formatLogColor,
  formatTimestamp,
} from "../../../lib/helpers";
import { Log } from "../../../lib/types";
import { borderSize } from "../../../theme/theme";

type Props = {
  log: Log;
  measure: () => void;
  style: React.CSSProperties;
};

const fontFamily = 'Monaco, "Lucida Console", monospace';

const textProps: TextProps & { style: CSSProperties } = {
  size: "14px",
  style: { fontFamily, lineHeight: "24px" },
};

export default function LogLine({ log, measure, style }: Props): JSX.Element {
  useEffect(() => {
    // re-measure when the log changes
    measure();
  }, [log, measure]);

  return (
    <Box
      align="start"
      background={formatLogBackground(log.severity)}
      border={{
        color: formatLogBorder(log.severity),
        side: "horizontal",
        size: borderSize.xsmall,
      }}
      direction="row"
      flex={false}
      pad={{ horizontal: "small" }}
      style={style}
    >
      <Text
        {...textProps}
        color={formatLogColor(log.severity, true)}
        margin={{ right: "small" }}
      >
        {formatTimestamp(log.timestamp)}
      </Text>
      <Text
        {...textProps}
        color={formatLogColor(log.severity)}
        margin={{ right: "large" }}
        wordBreak="break-word"
      >
        {log.message}
      </Text>
    </Box>
  );
}
