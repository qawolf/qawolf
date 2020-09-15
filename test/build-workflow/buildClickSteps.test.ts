import { loadFixtures } from '../loadFixtures';
import { buildClickSteps } from '../../src/build-workflow';
import { ElementEvent } from '../../src/types';

describe('buildClickSteps', () => {
  const events: Record<string, ElementEvent[]> = {};

  beforeAll(async () => {
    await Promise.all(
      ['login', 'radioInputs', 'searchGoogle', 'selectNative'].map(
        async (name) => {
          events[name] = (await loadFixtures(name)).events;
        },
      ),
    );
  });

  it('builds one click per group of mousedown/click events', () => {
    const steps = buildClickSteps(events.login);
    expect(steps.map((step) => (step.event as ElementEvent).selector)).toMatchSnapshot();
  });

  it('groups [mousedown, change, click] sequence together', () => {
    const steps = buildClickSteps(events.searchGoogle);
    expect(steps.map((step) => (step.event as ElementEvent).selector)).toMatchSnapshot();
  });

  it('prefers clicks on inputs', () => {
    const steps = buildClickSteps(events.radioInputs);
    expect(steps.map((step) => (step.event as ElementEvent).selector)).toMatchSnapshot();
  });

  it('skips click triggered by Enter', () => {
    const steps = buildClickSteps(events.login);

    // click on login link
    expect((steps[0].event as ElementEvent).target.attrs.href).toEqual('/login');

    // click on initial input
    expect((steps[1].event as ElementEvent).selector).toEqual('#username');

    // click logout
    expect((steps[2].event as ElementEvent).selector).toEqual('text=Log out');
  });

  it('skips click on select', () => {
    const steps = buildClickSteps(events.selectNative);
    expect(steps.length).toBe(0);
  });
});
