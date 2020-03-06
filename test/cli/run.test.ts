import { join } from 'path';
import { runJest } from '../../src/cli/run';

const rootDir = join(__dirname, '../e2e');

describe('runJest', () => {
  it('runs successful test', async () => {
    // expect it does not throw error
    runJest(['success'], { rootDir });
  });

  it('throws error for failed test', async () => {
    expect.assertions(1);

    try {
      runJest(['failure'], { rootDir });
    } catch (e) {
      expect(!!e).toBeTruthy();
    }
  });
});
