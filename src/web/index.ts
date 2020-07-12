export * from './qawolf';

import * as qawolf from './qawolf';

export type QAWolfWeb = typeof qawolf;

if (window) {
  new qawolf.PageEventCollector({
    attribute: (window as any).qawAttribute,
  });
}
