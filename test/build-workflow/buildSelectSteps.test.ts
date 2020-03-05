import { loadFixtures } from '../loadFixtures';
import { buildSelectSteps } from '../../src/build-workflow';
import { ElementEvent } from '../../src/types';

describe('buildSelectSteps', () => {
  let events: ElementEvent[];

  beforeAll(async () => {
    events = (await loadFixtures('selectNative')).events;
  });

  it('builds expected steps', async () => {
    const steps = buildSelectSteps(events);
    expect(steps).toMatchSnapshot();
  });
});
