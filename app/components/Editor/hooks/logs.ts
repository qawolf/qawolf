import axios from "axios";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";

import { RunnerClient } from "../../../lib/runner";
import { Log, Run } from "../../../lib/types";

type LogsHook = { logs: Log[] };

type UseLogs = {
  run: Run | null;
  wsUrl: string | null;
};

export const useLogs = ({ run, wsUrl }: UseLogs): LogsHook => {
  const { query } = useRouter();
  const runId = query.run_id;

  const [logs, setLogs] = useState<Log[]>([]);

  const logsUrl = run?.logs_url || null;

  // clear logs when the run changes
  useEffect(() => {
    setLogs([]);
  }, [runId]);

  // if logs URL exists, read logs from there
  useEffect(() => {
    if (!logsUrl) return;

    const signal = axios.CancelToken.source();

    axios
      .get(logsUrl, {
        cancelToken: signal.token,
      })
      .then((response) => {
        setLogs(response.data);
      });

    return () => {
      signal.cancel();
    };
  }, [logsUrl]);

  useEffect(() => {
    if (!wsUrl) return;

    const client = new RunnerClient();

    client.on("logscreated", (logs: Log[]) =>
      setLogs((prev) => [...prev, ...logs])
    );
    client.on("logs", (logs: Log[]) => setLogs(logs));

    client.subscribe({ type: "logs" });

    client.connect(wsUrl);

    return () => {
      client.close();
    };
  }, [wsUrl]);

  return { logs };
};
