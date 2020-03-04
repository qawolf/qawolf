import { join } from 'path';
import { runJest } from '../../src/cli/runJest';

const rootDir = join(__dirname, '../../e2e');

it('runs successful test', async () => {
  const exitCode = runJest(['success'], { path: rootDir });
  expect(exitCode).toEqual(0);
});

it('ignores error for failed test', async () => {
  const exitCode = runJest(['failure'], { path: rootDir });
  expect(exitCode).toEqual(1);
});
