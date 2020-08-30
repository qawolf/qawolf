import Debug from 'debug';

const debug = Debug('qawolf:VirtualCode');

type LinePatch = {
  newLines: string[];
  removedLines: string[];
};

export class VirtualCode {
  private _lines: string[] = [];

  constructor(lines: string[]) {
    this._lines = lines;
  }

  public buildPatch(compareTo: VirtualCode): LinePatch | null {
    let newLines: string[] = [];
    let removedLines: string[] = [];

    const compareToLines = compareTo.lines();

    // Get the list of existing lines that have been removed
    // from the end of the new line list.
    for (let existingLineIndex = 0; existingLineIndex < this._lines.length; existingLineIndex++) {
      const existingLine = this._lines[existingLineIndex];
      const compareToLine = compareToLines[existingLineIndex];
      if (existingLine !== compareToLine) {
        debug(
          'first changed line went from "%s" to "%s" at index %d',
          existingLine,
          compareToLine,
          existingLineIndex
        );
        removedLines = this._lines.slice(existingLineIndex);
        debug('found removed lines: %j', removedLines);
        newLines = compareToLines.slice(existingLineIndex);
        break;
      }
    }

    if (removedLines.length === 0) {
      debug('no changed lines');
      newLines = compareToLines.slice(this._lines.length);
    }

    if (newLines.length === 0) {
      debug('no new lines');
      return null;
    }

    debug('found new lines: %j', newLines);
    return { newLines, removedLines };
  }

  // for tests
  public code(): string {
    return this._lines.map(line => `${line}\n`).join('');
  }

  public lines(): string[] {
    return this._lines;
  }
}
