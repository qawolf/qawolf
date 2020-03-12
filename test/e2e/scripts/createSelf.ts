import callsites from 'callsites';
import * as qawolf from '../../../src';

export const createSelf = async (onReady: () => void): Promise<void> => {
  // 🐺 I code, therefore I am
  await qawolf.create({ onReady });
};

export const getCallSites = (): string[] =>
  callsites().map(c => c.getFileName());
