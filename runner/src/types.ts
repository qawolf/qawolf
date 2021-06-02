import { Frame, Page } from "playwright";

export type Artifacts = {
  gifUrl: string | null;
  jsonUrl: string | null;
  logsUrl: string;
  videoUrl: string | null;
};

export type BrowserName = "chromium" | "firefox" | "webkit";

export type Callback<S = void, T = void> = (data?: S) => T;

export type CodeUpdate = {
  code: string;
};

export interface CustomVideoMarkerMetadata {
  lineCode: string;
  lineNum: number;
  startTime: number;
}

export interface CustomVideoMetadata {
  markers?: CustomVideoMarkerMetadata[];
  timings?: number[];
}

export type ElementAction =
  | "check"
  | "click"
  | "fill"
  | "keyboard.press"
  | "press"
  | "selectOption"
  | "uncheck";

export interface ElementChosen {
  isFillable: boolean;
  selectors: string[];
  text: string;
}

export type ElementChooserValue = Partial<ElementChosen> & {
  isActive: boolean;
};

export interface ElementEvent {
  action: ElementAction;
  page: Page;
  frame?: Frame;
  frameSelector?: string;
  relatedClickSelector?: string;
  selector: string;
  time: number;
  value?: string | null;
}

export type Email = {
  from: string;
  html: string;
  subject: string;
  text: string;
  to: string;
};

export type ParsedEmail = Email & {
  urls: string[];
};

export interface LogEvent {
  level: string;
  message: string;
}

export type Run = {
  artifacts?: Artifacts;
  code: string;
  env?: Record<string, string>;
  helpers: string;
  id: string;
  test_id: string;
};

export type RunOptions = {
  artifacts?: Artifacts;
  code: string;
  code_to_run?: string;
  end_line?: number;
  env?: Record<string, string>;
  helpers: string;
  restart: boolean;
  run_id?: string;
  start_line?: number;
};

export type RunHook = {
  after?(result: RunProgress): Promise<void>;
  progress?(progress: RunProgress): Promise<void>;
  before?(): Promise<void>;
};

export type RunStatus = "created" | "fail" | "pass";

export type RunProgress = {
  code: string;
  completed_at: string | null;
  current_line: number;
  error?: string;
  run_id?: string;
  start_line?: number;
  status: RunStatus;
};

export type Suite = {
  env?: Record<string, string>;
  runs: Run[];
};

export type TextOperation =
  | {
      index: number;
      length: number;
      type: "delete";
    }
  | {
      index: number;
      type: "insert";
      value: string;
    };

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type Variables = { [key: string]: any };

export type WindowAction = "goBack" | "goto" | "popup" | "reload";

export interface WindowEvent {
  action: WindowAction;
  page: Page;
  popup?: Page;
  time: number;
  value?: string | null;
}
