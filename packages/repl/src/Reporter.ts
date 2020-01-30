export class Reporter {
  _globalConfig: any;
  _options: any;

  constructor(globalConfig: any, options: any) {
    this._globalConfig = globalConfig;
    this._options = options;
  }

  onRunComplete(contexts: any, results: any) {
    // console.log("Custom reporter output:");
    // console.log("GlobalConfig: ", this._globalConfig);
    // console.log("Options: ", this._options);
  }
}

module.exports = Reporter;
