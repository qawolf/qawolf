import { loadFixtures } from '../loadFixtures';
import { buildClickSteps } from '../../src/build-workflow';
import { ElementEvent } from '../../src/types';

describe('buildClickSteps', () => {
  let radioEvents: ElementEvent[];
  let loginEvents: ElementEvent[];
  let selectEvents: ElementEvent[];

  beforeAll(async () => {
    radioEvents = (await loadFixtures('radioInputs')).events;
    loginEvents = (await loadFixtures('login')).events;
    selectEvents = (await loadFixtures('selectNative')).events;
  });

  it('builds one click per group of mousedown/click events', () => {
    const steps = buildClickSteps(loginEvents);
    expect(
      steps.map((step) => loginEvents.indexOf(step.event)),
    ).toMatchSnapshot();
  });

  it('skips click triggered by Enter', () => {
    const steps = buildClickSteps(loginEvents);

    // check there is not a click on the password
    expect(steps.length).toEqual(3);

    // click on initial input
    expect(steps[1].event.selector).toEqual('#username');

    // click logout
    expect(steps[2].event.selector).toEqual('text=Log out');
  });

  it('skips click on select', () => {
    const steps = buildClickSteps(selectEvents);
    expect(steps.length).toBe(0);
  });

  it('prefers clicks on inputs', () => {
    const steps = buildClickSteps(radioEvents);
    expect(steps.map((step) => step.event.selector)).toMatchSnapshot();
  });
});
