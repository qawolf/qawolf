export type BrowserStep = {
  selector: ElementSelector;
  sourceEventId?: number;
  type: "click" | "type";
  value?: string;
};

export type ElementSelector = {
  classList?: string[] | null;
  href?: string | null;
  id?: string | null;
  inputType?: string | null;
  labels?: string[] | null;
  name?: string | null;
  parentText?: string[] | null;
  placeholder?: string | null;
  tagName?: string | null;
  textContent?: string | null;
  xpath?: string | null;
};

export type Job = {
  href: string;
  name?: string;
  steps: BrowserStep[];
};

export type Run = {
  name: string;
  status: Status;
  steps: Step[];
};

export type RunStatus = {
  runs: Run[];
  startTime: string;
  summary?: {
    fail: number;
    pass: number;
    total: number;
  } | null;
};

type Status = "fail" | "pass" | "queued" | "runs" | "unreached";

export type Step = {
  name: string;
  status: Status;
};
