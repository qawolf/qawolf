declare module "puppeteer/lib/USKeyboardLayout" {
  export interface KeyDefinition {
    code: string;
    key: string;
    keyCode?: number;
    location?: number;
    shiftKey?: string;
    shiftKeyCode?: number;
  }

  export interface KeyDefinitionsType {
    [key: string]: KeyDefinition;
  }

  const map: KeyDefinitionsType;
  export default map;
}
