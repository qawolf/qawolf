class ReplRegistry {
  private _context: any = {};

  setContextKey(key: string, value: any) {
    this._context[key] = value;
  }

  getContext() {
    return this._context;
  }
}

export const replRegistry = new ReplRegistry();
