import Debug from 'debug';
import { pathExists, readFile, remove, outputFile } from 'fs-extra';
import { CodeUpdater } from './CodeUpdater';

const debug = Debug('qawolf:CodeFileUpdater');

const loadCodeFile = async (path: string): Promise<string> => {
  const codeExists = await pathExists(path);
  if (!codeExists) throw new Error(`No code found at ${path}`);
  return readFile(path, 'utf8');
};

export class CodeFileUpdater extends CodeUpdater {
  private _path: string;
  protected _initialCode: string;

  public static async create(path: string): Promise<CodeFileUpdater> {
    debug(`load code from ${path}`);
    const initialCode = await loadCodeFile(path);
    const updater = new CodeFileUpdater(path);
    await updater._prepare();
    updater._initialCode = initialCode;
    return updater;
  }

  protected constructor(path: string) {
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

    if (process.env.QAW_CREATE === 'true') {
      debug('discard code');
      await remove(this._path);
    } else {
      debug('revert to initial code');
      await this._updateCode(this._initialCode);
    }
  }

  public path(): string {
    return this._path;
  }
}
