import { outputFile, pathExists, readFile } from 'fs-extra';
import { buildSteps } from '../../src/build-workflow/buildSteps';
import { CodeFileUpdater } from '../../src/create-code/CodeFileUpdater';
import { PATCH_HANDLE } from '../../src/create-code/patchCode';

// require manually since fs is mocked
// eslint-disable-next-line @typescript-eslint/no-var-requires
const { events } = require('../fixtures/login.json');
const steps = buildSteps({ events });

jest.mock('fs-extra');

(pathExists as jest.Mock).mockResolvedValue(true);

const mockedReadFile = readFile as jest.Mock;
const mockedOutputFile = outputFile as jest.Mock;

describe('CodeFileUpdater', () => {
  beforeEach(() => {
    mockedOutputFile.mockReset();
  });

  describe('discard', () => {
    it('reverts to initial code', () => {
      // TODO
    });

    it('removes code if there was not pre-existing code', () => {
      // TODO
    });
  });

  describe('finalize', () => {
    it('removes the patch handle', async () => {
      mockedReadFile.mockResolvedValue(
        `someCode();\n${PATCH_HANDLE}\notherCode();`,
      );
      const updater = new CodeFileUpdater('somepath');
      await updater.finalize();

      const updatedFile = mockedOutputFile.mock.calls[0][1];
      expect(updatedFile).toBe('someCode();\notherCode();');
    });
  });

  describe('prepare', () => {
    it('replaces qawolf.create call with the patch handle', async () => {
      mockedReadFile.mockResolvedValue(
        `  someCode();\n  await qawolf.create();\n  otherCode();`,
      );
      const updater = new CodeFileUpdater('somepath');
      await updater.prepare();

      const updatedFile = mockedOutputFile.mock.calls[0][1];
      expect(updatedFile).toBe(
        `  someCode();\n  // 🐺 CREATE CODE HERE\n  otherCode();`,
      );
    });

    it('throws an error if qawolf.create is not found', async () => {
      mockedReadFile.mockResolvedValue('no create');
      const updater = new CodeFileUpdater('somepath');
      // eslint-disable-next-line jest/valid-expect
      expect(updater.prepare()).rejects.toThrowError();
    });
  });

  describe('update', () => {
    it('saves code with new steps', async () => {
      const updater = new CodeFileUpdater('somepath');

      mockedReadFile.mockResolvedValue(
        `  someCode();\n  ${PATCH_HANDLE}\n  otherCode();`,
      );

      // emulate only the first two steps being ready
      await updater.update({ steps: steps.slice(0, 2) });

      const codeUpdateOne = mockedOutputFile.mock.calls[0][1];
      expect(codeUpdateOne).toMatchSnapshot();
      mockedReadFile.mockResolvedValueOnce(codeUpdateOne);

      await updater.update({ steps });
      const codeUpdateTwo = mockedOutputFile.mock.calls[1][1];
      expect(codeUpdateTwo).toMatchSnapshot();
    });
  });
});
