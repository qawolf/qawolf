import { Box } from "grommet";
import throttle from "lodash/throttle";
import { useContext, useEffect, useRef } from "react";
import {
  AutoSizer,
  CellMeasurer,
  CellMeasurerCache,
  List,
  ListRowRenderer,
  OnScrollParams,
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

let wasAutoScroll = false;
let shouldAutoScroll = true;

const scrollToBottom = throttle((list: List, index: number) => {
  if (!shouldAutoScroll) return;

  wasAutoScroll = true;
  list.scrollToRow(index);
}, 200);

function onScroll(this: List | undefined, options: OnScrollParams): void {
  if (!this || wasAutoScroll) {
    wasAutoScroll = false;
    return;
  }

  const maxScroll = this.getOffsetForRow(this.props.logs.length);

  // autoscroll if the user scrolled to the bottom 90%
  shouldAutoScroll = options.scrollTop >= maxScroll * 0.9;
}

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
  const ref = useRef<List>(null);

  useEffect(() => {
    if (!ref.current) return;
    scrollToBottom(ref.current, logs.length);
  }, [logs.length, ref]);

  if (!isVisible) return null;

  return (
    <Box fill>
      <AutoSizer>
        {({ height, width }) => {
          return (
            <List
              deferredMeasurementCache={cache}
              estimatedRowSize={20}
              height={height}
              logs={logs}
              onScroll={onScroll.bind(ref.current)}
              overscanRowCount={10}
              ref={ref}
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
