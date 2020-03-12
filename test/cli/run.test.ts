import { join } from 'path';
import { runJest } from '../../src/cli/run';

const rootDir = join(__dirname, '../e2e');

describe('runJest', () => {
  it('runs successful test', () => {
    expect(() => runJest(['success'], { rootDir })).not.toThrow();
  });

  it('throws error for failed test', () => {
    expect(() => runJest(['failure'], { rootDir })).toThrow();
  });
});
