import { Box } from "grommet";
import throttle from "lodash/throttle";
import { useCallback, useContext, useEffect, useState } from "react";
import {
  AutoSizer,
  CellMeasurer,
  CellMeasurerCache,
  List,
  ListRowRenderer,
} from "react-virtualized";

import { RunnerContext } from "../contexts/RunnerContext";
import { TestContext } from "../contexts/TestContext";
import { useLogs } from "../hooks/logs";
import LogLine from "./LogLine";

type Props = { isVisible: boolean };

const cache = new CellMeasurerCache({
  defaultHeight: 100,
  fixedWidth: true,
});

const scrollToBottom = throttle(
  (list: List, index: number) => {
    list.scrollToRow(index);
  },
  200,
  { leading: true }
);

const clearCache = throttle(() => {
  cache.clearAll();
}, 200);

const rowRenderer: ListRowRenderer = function ({
  index,
  key,
  parent,
  style,
}): JSX.Element {
  const log = parent.props.logs[index];

  return (
    <CellMeasurer cache={cache} key={key} parent={parent} rowIndex={index}>
      {({ measure }) => (
        <LogLine log={log} measure={measure} style={style}></LogLine>
      )}
    </CellMeasurer>
  );
};

export default function RunLogs({ isVisible }: Props): JSX.Element {
  const { apiKey, wsUrl } = useContext(RunnerContext);
  const { run } = useContext(TestContext);
  const { logs } = useLogs({ apiKey, run, wsUrl });
  const [list, setList] = useState<List>(null);

  const [size, setSize] = useState(0);

  const onRef = useCallback((value) => {
    setList(value);
  }, []);

  useEffect(() => {
    if (!list) return;

    scrollToBottom(list, logs.length);
  }, [list, logs.length]);

  useEffect(() => {
    // clear the heights cache when the size changes
    clearCache();
  }, [size]);

  if (!isVisible) return null;

  return (
    <Box fill>
      <AutoSizer>
        {({ height, width }) => {
          setSize(height + width);

          return (
            <List
              deferredMeasurementCache={cache}
              estimatedRowSize={20}
              height={height}
              logs={logs}
              overscanRowCount={10}
              ref={onRef}
              rowCount={logs.length}
              rowHeight={cache.rowHeight}
              rowRenderer={rowRenderer}
              style={{ outline: "none" }}
              width={width}
            />
          );
        }}
      </AutoSizer>
    </Box>
  );
}
