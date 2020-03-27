import { ensureDir, writeJson } from 'fs-extra';
import { prompt } from 'inquirer';
import { dirname, join } from 'path';
import { ContextEventCollector } from '../src/create-code/ContextEventCollector';
import { ElementEvent } from '../src/types';
import { launch } from '../src/utils';

// QAW_NAME=login QAW_URL=http://localhost:5000 npm run ts-node ./tests/saveFixture
(async (): Promise<void> => {
  const savePath = join(
    __dirname,
    'fixtures',
    `${process.env.QAW_NAME || 'fixtures'}.json`,
  );
  console.log('Save fixtures to', savePath);

  const browser = await launch({ headless: false });
  const context = await browser.newContext();
  const collector = await ContextEventCollector.create({ context });
  const page = await context.newPage();

  const events: ElementEvent[] = [];

  collector.on('elementevent', (event) => events.push(event));

  page.goto(process.env.QAW_URL);

  const { choice } = await prompt<{ choice: string }>([
    {
      choices: ['Save', 'Discard'],
      message: `Save ${savePath}`,
      name: 'choice',
      type: 'list',
    },
  ]);

  if (choice === 'Save') {
    await ensureDir(dirname(savePath));
    await writeJson(savePath, { events });
  }

  await browser.close();
})();
