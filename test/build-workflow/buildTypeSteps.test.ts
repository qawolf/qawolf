import { loadFixtures } from '../loadFixtures';
import { buildTypeSteps } from '../../src/build-workflow';

describe('buildTypeSteps', () => {
  it('builds expected steps for login', async () => {
    const events = (await loadFixtures('login')).events;
    const steps = buildTypeSteps(events);
    expect(steps).toMatchSnapshot();
  });

  it('builds expected steps for selectall', async () => {
    const events = (await loadFixtures('textInputsSelectAll')).events;
    const steps = buildTypeSteps(events);
    expect(steps).toMatchSnapshot();
  });

  // TODO
  // it('builds expected steps for hotkeys', async () => {
  //   const events = await loadEvents('githubIssuesShortcut');
  //   const steps = buildTypeSteps(events);
  //   expect(steps).toMatchSnapshot();
  // });
});
