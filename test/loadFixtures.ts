import { readJSON } from 'fs-extra';
import { join } from 'path';
import { ElementEvent } from '../src/types';

type Fixtures = {
  events: ElementEvent[];
};

export const loadFixtures = async (name: string): Promise<Fixtures> => {
  const eventsPath = join(__dirname, `fixtures/${name}.json`);
  const fixtures = await readJSON(eventsPath);
  return fixtures as Fixtures;
};
