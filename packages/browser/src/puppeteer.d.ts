declare module "puppeteer/lib/USKeyboardLayout" {
  type KeyDefinition = {
    code: string;
    key: string;
    keyCode?: number;
    location?: number;
    shiftKey?: string;
    shiftKeyCode?: number;
  };

  type KeyDefinitionsType = { [key: string]: KeyDefinition };

  const map: KeyDefinitionsType;

  export = map;
}
