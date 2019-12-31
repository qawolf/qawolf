const Xvfb = require("xvfb");

export class Display {
  private _xvfb: any;

  protected constructor(xvfb: any) {
    this._xvfb = xvfb;
  }

  public get value() {
    return this._xvfb.display();
  }

  public static start(): Promise<Display> {
    return new Promise((resolve, reject) => {
      const xvfb = new Xvfb();

      xvfb.start(function(err: any) {
        if (err) reject(err);
        else resolve(new Display(xvfb));
      });
    });
  }

  public stop() {
    return new Promise((resolve, reject) => {
      this._xvfb.stop(function(err: any) {
        if (err) reject(err);
        resolve();
      });
    });
  }
}
