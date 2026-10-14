export type CliInvocation = {
  readonly compiled: boolean;
  readonly execPath: string;
  readonly scriptPath: string | undefined;
};

export type HelperCommand =
  | { readonly command: string; readonly status: "ready" }
  | { readonly status: "temporary-install" };

const helperSubcommand = "auth git-credential";
const temporaryInstallPath = /[\\/](?:_npx|bunx-[^\\/]*)[\\/]/;

function quoteForShell(value: string): string {
  return `'${value.replaceAll("'", `'\\''`)}'`;
}

export function resolveHelperCommand(invocation: CliInvocation): HelperCommand {
  if (invocation.compiled) {
    return {
      command: `!${quoteForShell(invocation.execPath)} ${helperSubcommand}`,
      status: "ready",
    };
  }
  const { scriptPath } = invocation;
  if (scriptPath === undefined || temporaryInstallPath.test(scriptPath)) {
    return { status: "temporary-install" };
  }
  return {
    command: `!${quoteForShell(invocation.execPath)} ${quoteForShell(scriptPath)} ${helperSubcommand}`,
    status: "ready",
  };
}

export function isCliHelperEntry(entry: string): boolean {
  return entry.startsWith("!") && entry.endsWith(` ${helperSubcommand}`);
}

export function defaultCliInvocation(): CliInvocation {
  return {
    compiled: process.env.QAWOLF_COMPILED === "true",
    execPath: process.execPath,
    scriptPath: process.argv[1],
  };
}
