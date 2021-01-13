import debug from "debug";
import { EventEmitter } from "events";
import { throttle } from "lodash";

type Severity = "verbose" | "info" | "warning" | "error";

export type Log = {
  message: string;
  severity: Severity;
  timestamp: string;
};

const debugLog = debug.log;

export class Logger extends EventEmitter {
  _logs: Log[] = [];
  _pending: Log[] = [];

  constructor() {
    super();
    this._capturePlaywrightLogs();
  }

  _capturePlaywrightLogs(): void {
    // playwright's logger sink stopped providing detailed pw:api logs
    // after they moved to an internal wire protocol in >= 1.4.x
    // so we intercept them at the debug package
    debug.log = (...args) => {
      debugLog.apply(debug, args);

      const [message] = args;

      const pwIndex = message?.indexOf("pw:api");
      if (pwIndex < 0) return;

      // start the message after the time
      const sanitized = message.substring(pwIndex);
      this.log("playwright", "verbose", sanitized);
    };
  }

  close(): void {
    debug.log = debugLog;
    this.removeAllListeners();
  }

  get logs(): Log[] {
    return this._logs;
  }

  log(name: string, severity: Severity, message: Error | string): void {
    let logMessage = (message as Error).message || (message as string);

    if (name === "console") {
      logMessage = "CONSOLE: " + logMessage;
    }

    const log = {
      message: logMessage,
      severity,
      timestamp: new Date().toISOString(),
    };

    this._logs.push(log);
    this._pending.push(log);
    this.sendLogs();
  }

  // batch the logs to not overwhelm the websocket
  sendLogs = throttle(
    () => {
      this.emit("logscreated", this._pending);
      this._pending = [];
    },
    100,
    { leading: true, trailing: true }
  );
}
