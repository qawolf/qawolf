import { loadFixtures } from '../loadFixtures';
import { buildSteps } from '../../src/build-workflow';
import { ElementEvent } from '../../src/types';

describe('buildSteps', () => {
  let events: ElementEvent[];

  beforeAll(async () => {
    events = (await loadFixtures('login')).events;
  });

  it('builds expected steps', () => {
    const steps = buildSteps(events);
    expect(steps).toMatchSnapshot();
  });
});
