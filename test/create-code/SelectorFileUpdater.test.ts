import { outputJson, pathExists, readJson, remove } from 'fs-extra';
import { buildSteps } from '../../src/build-workflow/buildSteps';
import { SelectorFileUpdater } from '../../src/create-code/SelectorFileUpdater';

// require manually since fs is mocked
// eslint-disable-next-line @typescript-eslint/no-var-requires
const { events } = require('../fixtures/login.json');
const steps = buildSteps(events);

jest.mock('fs-extra');

(pathExists as jest.Mock).mockResolvedValue(true);

const mockedOutputJson = outputJson as jest.Mock;
const mockedReadJson = readJson as jest.Mock;
const mockedRemove = remove as jest.Mock;

describe('SelectorFileUpdater', () => {
  beforeEach(() => {
    mockedOutputJson.mockReset();
  });

  describe('discard', () => {
    it('reverts to initial selectors', async () => {
      const initial = ['css=selector0', 'css=selector1'];
      mockedReadJson.mockResolvedValue(initial);
      const updater = await SelectorFileUpdater.create('revertpath');
      await updater.discard();
      const reverted = mockedOutputJson.mock.calls[0];
      expect(reverted[0]).toEqual('revertpath');
      expect(reverted[1]).toEqual(initial);
      expect(mockedRemove.mock.calls.length).toEqual(0);
    });

    it('removes file if there were no initial selectors', async () => {
      const initial = [];
      mockedReadJson.mockResolvedValue(initial);
      const updater = await SelectorFileUpdater.create('removepath');
      await updater.discard();
      expect(mockedRemove.mock.calls[0][0]).toEqual('removepath');
    });
  });

  describe('update', () => {
    it('appends new selectors', async () => {
      const initial = ['css=selector0'];
      mockedReadJson.mockResolvedValue(initial);

      const updater = await SelectorFileUpdater.create('revertpath');

      // emulate only the first step being ready
      await updater.update({ steps: steps.slice(0, 1) });
      const revisionOne = mockedOutputJson.mock.calls[0][1];
      expect(revisionOne).toMatchSnapshot();
      mockedReadJson.mockResolvedValueOnce(revisionOne);

      await updater.update({ steps: steps.slice(0, 2) });
      const revisionTwo = mockedOutputJson.mock.calls[1][1];
      expect(revisionTwo).toMatchSnapshot();
    });
  });
});
