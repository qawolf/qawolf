export interface CaptureOffset {
  x: number;
  y: number;
}

export interface CaptureSize {
  height: number;
  width: number;
}

export interface CaptureOptions {
  offset?: CaptureOffset;
  savePath: string;
  size: CaptureSize;
}
