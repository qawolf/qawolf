import stripAnsi from "strip-ansi";

export default function mockConsole(): Record<string, string[] | string[][]> {
  const calls = {};

  ["debug", "error", "info", "log", "warn"].forEach((level) => {
    calls[level] = [];
    jest.spyOn(global.console, level as any).mockImplementation((...args) => {
      // Remove invisible color characters because they aren't matched
      // correctly on every operating system.
      const cleanArgs = args.map((arg) => {
        if (typeof arg === "string") return stripAnsi(arg);
        return arg;
      });

      if (cleanArgs.length === 1) {
        calls[level].push(cleanArgs[0]);
      } else if (args.length > 1) {
        calls[level].push(cleanArgs);
      }
    });
  });

  return calls;
}
