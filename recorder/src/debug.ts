const debugConsole = console.debug;

export function debug(...args: any[]): void {
  // prevent an error if a site overrides console
  if (!debugConsole) return;

  debugConsole("qawolf:", ...args);
}
