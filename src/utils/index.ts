// context utils
export { forEachPage } from './context/forEachPage';
export { register } from './context/register';
export {
  saveArtifacts,
  saveConsoleLogs,
  stopVideos,
} from './context/saveArtifacts';
export { waitForPage, WaitForPageOptions } from './context/waitForPage';

// page utils
export { openScreenshot } from './page/openScreenshot';
export { saveState } from './page/saveState';
export { scroll, ScrollOptions, ScrollValue } from './page/scroll';
export { setState } from './page/setState';

// global utils
export { getLaunchOptions, launch } from './launch';
export { repl } from './repl/repl';
export { Registry } from './Registry';
export { waitFor } from './waitFor';
