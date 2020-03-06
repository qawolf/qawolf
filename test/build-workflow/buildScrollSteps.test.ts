import { loadFixtures } from '../loadFixtures';
import { buildScrollSteps } from '../../src/build-workflow';
import { ElementEvent } from '../../src/types';

describe('buildScrollSteps', () => {
  let events: ElementEvent[];

  beforeAll(async () => {
    events = (await loadFixtures('infiniteScroll')).events;
  });

  it('builds expected steps', async () => {
    const steps = buildScrollSteps(events);
    expect(steps).toMatchSnapshot();
  });
});
