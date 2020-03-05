import { CodeUpdater } from './CodeUpdater';
import { pathExists, readFile, outputFile } from 'fs-extra';

export class CodeFileUpdater extends CodeUpdater {
  private _path: string;

  public constructor(path: string) {
    super();
    this._path = path;
  }

  protected async loadCode(): Promise<string> {
    const codeExists = await pathExists(this._path);
    if (!codeExists) throw new Error(`No code found at ${this._path}`);

    return readFile(this._path, 'utf8');
  }

  protected async updateCode(code: string): Promise<void> {
    await outputFile(this._path, code, 'utf8');
  }
}
