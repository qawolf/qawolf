import { join, relative } from 'path';
import { getCodePath } from '../../src/cli/getCodePath';

const rootDir = join(__dirname, '../.qawolf');

describe('getCodePath', () => {
  it('finds path in rootDir', async () => {
    const path = await getCodePath({ name: 'scroll.test', rootDir });
    expect(relative(rootDir, path)).toEqual('scroll.test.js');
  });

  it('finds path in a subfolder', async () => {
    const path = await getCodePath({ name: 'keys', rootDir });

    expect(relative(rootDir, path).replace(/\\/g, '/')).toEqual(
      'inputs/keys.test.js',
    );
  });

  it('finds an absolute path', async () => {
    const absolutePath = join(rootDir, 'scroll.test.js');

    const path = await getCodePath({
      name: absolutePath,
      rootDir,
    });
    expect(path).toEqual(absolutePath);
  });

  it('throws an error if not a file', async () => {
    await expect(
      getCodePath({
        name: rootDir,
        rootDir,
      }),
    ).rejects.toMatchInlineSnapshot(`[Error: No files match "${rootDir}"]`);
  });

  it('throws an error if multiple matching files', async () => {
    await expect(
      getCodePath({
        name: 'test',
        rootDir,
      }),
    ).rejects.toMatchInlineSnapshot(`[Error: Multiple files match "test"]`);
  });

  it('throws an error if no matching files', async () => {
    await expect(
      getCodePath({
        name: 'mytest',
        rootDir,
      }),
    ).rejects.toMatchInlineSnapshot(`[Error: No files match "mytest"]`);
  });
});
