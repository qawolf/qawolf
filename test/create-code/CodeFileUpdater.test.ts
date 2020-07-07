import { outputFile, pathExists, readFile, remove } from 'fs-extra';
import { buildSteps } from '../../src/build-workflow/buildSteps';
import { CodeFileUpdater } from '../../src/create-code/CodeFileUpdater';
import { CREATE_HANDLE, PATCH_HANDLE } from '../../src/create-code/patchCode';

// require manually since fs is mocked
// eslint-disable-next-line @typescript-eslint/no-var-requires
const { events } = require('../fixtures/login.json');
const steps = buildSteps(events);

jest.mock('fs-extra');

(pathExists as jest.Mock).mockResolvedValue(true);

const mockedReadFile = readFile as jest.Mock;
const mockedRemove = remove as jest.Mock;
const mockedOutputFile = outputFile as jest.Mock;

describe('CodeFileUpdater', () => {
  beforeEach(() => {
    mockedOutputFile.mockReset();
  });

  describe('discard', () => {
    it('reverts to initial code', async () => {
      const initialCode = `initialCode()\n${CREATE_HANDLE}`;
      mockedReadFile.mockResolvedValue(initialCode);
      const updater = await CodeFileUpdater.create('revertpath');
      await updater.discard();

      const reverted = mockedOutputFile.mock.calls[1];
      expect(reverted[0]).toEqual('revertpath');
      expect(reverted[1]).toEqual(initialCode);
      expect(mockedRemove.mock.calls.length).toEqual(0);
    });

    it('removes code if QAW_CREATE is set to true', async () => {
      process.env.QAW_CREATE = 'true';
      const initialCode = `initialCode()\n${CREATE_HANDLE}`;
      mockedReadFile.mockResolvedValue(initialCode);
      const updater = await CodeFileUpdater.create('removepath');
      await updater.discard();
      expect(mockedRemove.mock.calls[0][0]).toEqual('removepath');
      process.env.QAW_CREATE = undefined;
    });
  });

  describe('create', () => {
    it('replaces qawolf.create call with the patch handle', async () => {
      mockedReadFile.mockResolvedValue(
        `  someCode();\n  await qawolf.create();\n  otherCode();`,
      );
      await CodeFileUpdater.create('somepath');

      const updatedFile = mockedOutputFile.mock.calls[0][1];
      expect(updatedFile).toBe(
        `  someCode();\n  ${PATCH_HANDLE}\n  otherCode();`,
      );
    });
  });

  describe('finalize', () => {
    it('removes the patch handle', async () => {
      mockedReadFile.mockResolvedValue(
        `someCode();\n${PATCH_HANDLE}\notherCode();`,
      );

      const updater = await CodeFileUpdater.create('somepath');
      await updater.finalize();

      const updatedFile = mockedOutputFile.mock.calls[0][1];
      expect(updatedFile).toBe('someCode();\notherCode();');
    });
  });

  describe('update', () => {
    it('saves code with new steps', async () => {
      mockedReadFile.mockResolvedValue(
        `  someCode();\n  ${PATCH_HANDLE}\n  otherCode();`,
      );

      const updater = await CodeFileUpdater.create('somepath');

      const codeUpdateEvents = [];

      updater.on('codeupdate', (code) => {
        codeUpdateEvents.push(code);
      });

      // emulate only the first two steps being ready
      await updater.update({ steps: steps.slice(0, 2) });

      const codeUpdateOne = mockedOutputFile.mock.calls[0][1];
      expect(codeUpdateOne).toMatchSnapshot();
      expect(codeUpdateEvents[0]).toMatch(codeUpdateOne);
      mockedReadFile.mockResolvedValueOnce(codeUpdateOne);

      await updater.update({ steps });
      const codeUpdateTwo = mockedOutputFile.mock.calls[1][1];
      expect(codeUpdateEvents[1]).toMatch(codeUpdateTwo);
      expect(codeUpdateTwo).toMatchSnapshot();
    });
  });
});
