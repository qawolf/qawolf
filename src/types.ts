export type BrowserName = 'chromium' | 'firefox' | 'webkit';

export type Callback<S = void, T = void> = (data?: S) => T;
