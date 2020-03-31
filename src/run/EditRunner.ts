import { EditOptions, spawnEdit } from './spawnEdit';
import { ChildProcess } from 'child_process';

export class EditRunner {
  private _options: EditOptions;
  private _process: ChildProcess;

  public static async start(options: EditOptions): Promise<EditRunner> {
    const runner = new EditRunner(options);
    return runner;
  }

  protected constructor(options: EditOptions) {
    this._options = { ...options };

    this._process = spawnEdit(this._options);
  }

  kill(): void {
    this._process.kill('SIGTERM');
  }
}
