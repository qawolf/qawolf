import { buildWorkflow } from "@qawolf/build-workflow";
import { ElementEvent } from "@qawolf/types";

export const CREATE_CODE_SYMBOL = "// 🐺 CREATE CODE HERE";

type ConstructorOptions = {
  device?: string;
  isTest?: boolean;
  name: string;
  url: string;
};

// TODO we need to update selectors too?

export class CodeUpdater {
  private _events: ElementEvent[] = [];
  private _options: ConstructorOptions;

  constructor(options: ConstructorOptions) {
    this._options = options;
  }

  public get hasUpdates() {
    return true;
  }

  public prepare(event: ElementEvent) {
    this._events.push(event);

    const workflow = buildWorkflow({
      device: this._options.device,
      events: this._events,
      name: this._options.name,
      url: this._options.url
    });
  }

  public update(code: string): string | null {
    return null;
  }
}
