import { readFile } from 'fs-extra';
import { prompt } from 'inquirer';
import { join, relative } from 'path';
import { launch, register, waitFor } from 'playwright-utils';
import { getSelectorPath, getCodePath } from '../../src/create-code/create';
import { createSelf, getCallSites } from '../.qawolf/scripts/createSelf';
import { TEST_URL } from '../utils';

jest.mock('inquirer');

describe('create', () => {
  it('works end-to-end', async () => {
    let fulfillPrompt: ({ choice: string }) => void;
    ((prompt as unknown) as jest.Mock).mockResolvedValue(
      new Promise<{ choice: string }>(resolve => (fulfillPrompt = resolve)),
    );

    const filePath = join(__dirname, '../.qawolf/scripts/createSelf.ts');
    const loadCode = (): Promise<string> => readFile(filePath, 'utf8');

    const initial = await loadCode();
    // check the initial code has not changed
    expect(initial).toMatchSnapshot('1-initial');

    // set up context
    const browser = await launch();
    const context = await browser.newContext();
    await register(context);
    const page = await context.newPage();
    await page.goto(`${TEST_URL}text-inputs`);

    // wait until the creation is ready
    let createdPromise: Promise<void>;
    await new Promise(onReady => {
      createdPromise = createSelf(onReady);
    });

    // check the patch handle replaces the create handle
    expect(await loadCode()).toMatchSnapshot('2-prepared');

    // perform an action
    await page.type("[data-qa='html-text-input']", 'hello');

    // check the code updated as expected
    await waitFor(async () => (await loadCode()).includes('hello'));
    expect(await loadCode()).toMatchSnapshot('3-updated');

    // discard the changes
    fulfillPrompt({ choice: 'Discard' });
    await createdPromise;

    const reverted = await loadCode();
    expect(reverted).toEqual(initial);
    expect(reverted).toMatchSnapshot('4-reverted');

    await browser.close();
  });
});

describe('getCodePath', () => {
  it('finds the caller file with create handle', async () => {
    const codePath = await getCodePath(getCallSites());
    const relativePath = relative(__filename, codePath);
    expect(relativePath).toEqual('../../.qawolf/scripts/createSelf.ts');
  });
});

describe('getSelectorPath', () => {
  it('returns a sibling path for the code file', () => {
    const selectorPath = getSelectorPath(__filename);
    const relativePath = relative(__filename, selectorPath);
    expect(relativePath).toEqual('../../selectors/create.json');
  });
});
