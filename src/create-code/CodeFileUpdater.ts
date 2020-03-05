import { CodeUpdater } from './CodeUpdater';
import { pathExists, readFile, remove, outputFile } from 'fs-extra';

const loadCodeFile = async (path: string): Promise<string> => {
  const codeExists = await pathExists(path);
  if (!codeExists) throw new Error(`No code found at ${path}`);
  return readFile(path, 'utf8');
};

export class CodeFileUpdater extends CodeUpdater {
  private _path: string;
  protected _initialCode: string;

  public static async create(path: string): Promise<CodeFileUpdater> {
    const updater = new CodeFileUpdater(path);
    // TODO some sort of env variable to know if this is a new file and not to set this...
    updater._initialCode = await loadCodeFile(path);
    return updater;
  }

  public constructor(path: string) {
    super();
    this._path = path;
  }

  protected async _loadCode(): Promise<string> {
    return loadCodeFile(this._path);
  }

  protected async _updateCode(code: string): Promise<void> {
    await outputFile(this._path, code, 'utf8');
  }

  public async discard(): Promise<void> {
    this._locked = true;

    if (this._initialCode) {
      await this._updateCode(this._initialCode);
    } else {
      await remove(this._path);
    }
  }

  public path(): string {
    return this._path;
  }
}
