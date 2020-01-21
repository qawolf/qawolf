export const captureLogs = () => {
  const serverLog = (window as any).qaw_log;
  if (!serverLog) return;

  ["debug", "error", "info", "log", "warn"].forEach((level: keyof Console) => {
    const browserLog = console[level].bind(console);

    console[level] = (...args: any) => {
      browserLog(...args);

      const message = args.map((arg: any) => arg.toString()).join(" ");
      serverLog(level, message);
    };
  });
};
