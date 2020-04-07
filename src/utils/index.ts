// context utils
export { forEachPage } from './context/forEachPage';
export { indexPages, IndexedPage } from './context/indexPages';
export { saveArtifacts, stopVideos } from './context/saveArtifacts';
export { waitForPage, WaitForPageOptions } from './context/waitForPage';

// page utils
export { initEvaluateScript } from './page/initEvaluateScript';
export { interceptConsoleLogs } from './page/interceptConsoleLogs';
export { openScreenshot } from './page/openScreenshot';
export { saveConsoleLogs } from './page/saveConsoleLogs';
export { saveState } from './page/saveState';
export { scroll, ScrollOptions, ScrollValue } from './page/scroll';
export { setState } from './page/setState';

// global utils
export { getLaunchOptions, launch } from './launch';
export { repl } from './repl/repl';
export { Registry } from './Registry';
export { register } from './register';
export { waitFor } from './waitFor';
