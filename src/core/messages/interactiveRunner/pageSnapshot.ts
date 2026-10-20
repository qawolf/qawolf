const locatorLine = (locator: string) => `locator: ${locator}`;

export const pageSnapshotMessages = {
  locatorLine,
  pageSnapshotNoPage:
    "The runner's browser has no page open, so there is nothing to read. Open one with qawolf runner act navigate --url <url>, or run a flow, then try again.",
  pageSnapshotNoAnswer:
    "The page did not answer in time. A page that is gone or part-way through navigating does not answer at all, so take a screenshot to see where the runner is, then try again.",
  pageSnapshotsNotEnabled:
    "Page snapshots are not turned on for your team, so qawolf runner snapshot and qawolf runner ref are unavailable. Retrying will not help: use qawolf runner screenshot and qawolf runner act instead.",
  runnerCannotSnapshotPages:
    "This runner has no web browser, so it has no page to read or act on by ref. Retrying will never help: launch a playwright runner instead.",
  pageSnapshotAnsweredUnknown: (failureReason: string) =>
    `The runner answered "${failureReason}", which this version of the CLI does not know how to report. Upgrade with npm install -g @qawolf/cli.`,
  refNotFound: (ref: string) =>
    `The page no longer has an element ${ref}. A ref belongs to the latest snapshot, so run qawolf runner snapshot again and use a ref from that.`,
  refActionFailed: (
    errorMessage: string | undefined,
    locator: string | undefined,
  ) =>
    [
      `The element was found and the action did not complete${errorMessage === undefined ? "." : `: ${errorMessage}`}`,
      ...(locator === undefined ? [] : [locatorLine(locator)]),
    ].join("\n"),
  refActionScreenshotNotTaken: (actionName: string, detail: string) =>
    `Performed ${actionName}, but its screen could not be taken: ${detail}. The action took effect, so do not repeat it: take the screen with qawolf runner screenshot.`,
} as const;
