import { loadFixtures } from '../loadFixtures';
import { buildSelectOptionSteps } from '../../src/build-workflow';
import { ElementEvent } from '../../src/types';

describe('buildSelectOptionSteps', () => {
  let events: ElementEvent[];

  beforeAll(async () => {
    events = (await loadFixtures('selectNative')).events;
  });

  it('builds expected steps', async () => {
    const steps = buildSelectOptionSteps(events);
    expect(steps).toMatchSnapshot();
  });
});
