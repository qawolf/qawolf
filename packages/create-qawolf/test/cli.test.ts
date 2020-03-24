import { promptRootDir } from '../src/cli';

describe('promptRootDir', () => {
  it('defaults to qawolf', async () => {
    const promise = promptRootDir();
    process.stdin.push('\n');
    const rootDir = await promise;
    expect(rootDir).toEqual('.qawolf');
  });

  it('accepts user input', async () => {
    const promise = promptRootDir();
    process.stdin.push('tests/e2e');
    process.stdin.push('\n');
    const rootDir = await promise;
    expect(rootDir).toEqual('tests/e2e');
  });
});
