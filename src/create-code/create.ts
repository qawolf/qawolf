import Debug from 'debug';
import { prompt } from 'inquirer';
import { relative } from 'path';
import { BrowserContext } from 'playwright-core';
import { repl } from 'playwright-utils';
import { buildSteps } from '../build-workflow/buildSteps';
import { CodeFileUpdater } from './CodeFileUpdater';
import { ContextEventCollector } from '../ContextEventCollector';
import { SelectorFileUpdater } from './SelectorFileUpdater';
import { ElementEvent } from '../types';

const debug = Debug('create-playwright:create');

export type Options = {
  codePath: string;
  context: BrowserContext;
  selectorPath: string;
};

const savePrompt = async (codePath: string): Promise<boolean> => {
  const { choice } = await prompt<{ choice: string }>([
    {
      choices: [
        '💾  Save and exit',
        '🖥️  Open REPL to run code',
        '🗑️  Discard and exit',
      ],
      message: `Edit your code at: ${relative(process.cwd(), codePath)}`,
      name: 'choice',
      type: 'list',
    },
  ]);

  if (choice.includes('REPL')) {
    await repl();
    // prompt again
    return savePrompt(codePath);
  }

  if (choice.includes('Save')) {
    return true;
  }

  return false;
};

export const create = async (options: Options): Promise<void> => {
  // TODO set repl context...
  debug(
    `create code at ${options.codePath} selectors at ${options.selectorPath}`,
  );

  const codeUpdater = new CodeFileUpdater(options.codePath);
  const selectorUpdater = await SelectorFileUpdater.create(
    options.selectorPath,
  );

  const collector = await ContextEventCollector.create({
    context: options.context,
  });

  // push step index behind existing selectors
  const stepStartIndex = selectorUpdater.selectors().length;

  const events: ElementEvent[] = [];

  collector.on('elementevent', async event => {
    events.push(event);

    const steps = buildSteps({ events, startIndex: stepStartIndex });
    await Promise.all([
      codeUpdater.update({ steps }),
      selectorUpdater.update({ steps }),
    ]);
  });

  const save = await savePrompt(options.codePath);
  if (save) {
    // TODO finalize
  } else {
    // TODO discard
  }
};
