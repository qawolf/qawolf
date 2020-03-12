import Debug from 'debug';

const debug = Debug('qawolf:VirtualCode');

type LinePatch = {
  original: string;
  updated: string;
};

export class VirtualCode {
  private _lines: string[] = [];

  constructor(lines: string[]) {
    this._lines = lines;
  }

  public buildPatch(compareTo: VirtualCode): LinePatch | null {
    /**
     * Check if the last line changed.
     */
    const lastIndex = this._lines.length - 1;
    if (lastIndex < 0) {
      debug('no lines to update');
      return null;
    }

    const lastLine = this._lines[lastIndex];

    const compareToLines = compareTo.lines();
    if (lastIndex >= compareToLines.length) {
      // if the last line no longer exists
      // we will update it when a new line arrives
      debug('last line no longer exists, wait to update');
      return null;
    }

    const compareToLastLine = compareToLines[lastIndex];
    if (lastLine === compareToLastLine) {
      debug(
        'last line did not change: "%j" === "%j"',
        lastLine,
        compareToLastLine,
      );
      return null;
    }

    debug('last line changed from "%j" to "%j"', lastLine, compareToLastLine);
    return { original: lastLine, updated: compareToLastLine };
  }

  // for tests
  public code(): string {
    return this._lines.map(line => `${line}\n`).join('');
  }

  public lines(): string[] {
    return this._lines;
  }

  public newLines(compareTo: VirtualCode): string[] {
    const newLines = compareTo.lines().slice(this._lines.length);
    return newLines;
  }
}
