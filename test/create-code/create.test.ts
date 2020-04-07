import { readFile } from 'fs-extra';
import { prompt } from 'inquirer';
import { join } from 'path';
import { Browser, Page } from 'playwright';
import { getSelectorPath, getCreatePath } from '../../src/create-code/create';
import { launch, register, waitFor } from '../../src/utils';
import { createSelf, getCallSites } from '../.qawolf/createSelf';
import { TEST_URL } from '../utils';

jest.mock('inquirer');

describe('create', () => {
  describe('end-to-end', () => {
    let browser: Browser;
    let createdPromise: Promise<void>;
    let fulfillPrompt: ({ choice: string }) => void;
    let initialCode: string;
    let page: Page;

    const loadCode = (): Promise<string> => {
      const filePath = join(__dirname, '../.qawolf/createSelf.ts');
      return readFile(filePath, 'utf8');
    };

    beforeAll(async () => {
      ((prompt as unknown) as jest.Mock).mockResolvedValue(
        new Promise<{ choice: string }>((resolve) => (fulfillPrompt = resolve)),
      );

      browser = await launch();
      const context = await browser.newContext();
      await register(context);
      page = await context.newPage();
      await page.goto(`${TEST_URL}text-inputs`);
    });

    afterAll(() => browser.close());

    it('has the correct initial code', async () => {
      initialCode = await loadCode();
      // check the initial code has not changed
      expect(initialCode).toMatchSnapshot('1-initial');
    });

    it('replaces create handle with the patch handle', async () => {
      // wait until the creation is ready
      await new Promise((onReady) => {
        createdPromise = createSelf(onReady);
      });

      // check the patch handle replaces the create handle
      expect(await loadCode()).toMatchSnapshot('2-prepared');
    });

    it('inserts new code', async () => {
      await page.type("[data-qa='html-text-input']", 'hello');

      // check the code updated as expected
      await waitFor(async () => (await loadCode()).includes('hello'));

      expect(await loadCode()).toMatchSnapshot('3-updated');
    });

    it('reverts the changes', async () => {
      // discard the changes
      fulfillPrompt({ choice: 'Discard' });
      await createdPromise;

      const reverted = await loadCode();
      expect(reverted).toEqual(initialCode);
      expect(reverted).toMatchSnapshot('4-reverted');
    });
  });
});

describe('getCreatePath', () => {
  it('finds the caller file with create handle', async () => {
    const codePath = await getCreatePath(getCallSites());
    expect(codePath).toEqual(join(__dirname, '../.qawolf/createSelf.ts'));
  });
});

describe('getSelectorPath', () => {
  it('returns a subfolder inside the code directory', () => {
    const selectorPath = getSelectorPath(__filename);
    expect(selectorPath).toEqual(join(__dirname, './selectors/create.json'));
  });
});
