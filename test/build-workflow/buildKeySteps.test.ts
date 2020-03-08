import { loadFixtures } from '../loadFixtures';
import { buildKeySteps } from '../../src/build-workflow';

describe('buildKeySteps', () => {
  it('builds expected steps for login', async () => {
    const events = (await loadFixtures('login')).events;
    const steps = buildKeySteps(events);
    expect(steps).toMatchSnapshot();
  });

  it('builds expected steps for modifier keys', async () => {
    const events = (await loadFixtures('textInputsModifierKeys')).events;
    const steps = buildKeySteps(events);
    expect(steps).toMatchSnapshot();
  });

  it('builds expected steps for selectall', async () => {
    const events = (await loadFixtures('textInputsSelectAll')).events;
    const steps = buildKeySteps(events);
    expect(steps).toMatchSnapshot();
  });

  // TODO add test that page changes split steps
});
