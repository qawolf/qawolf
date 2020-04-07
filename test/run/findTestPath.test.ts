import { join, relative } from 'path';
import { findTestPath } from '../../src/run/findTestPath';

const rootDir = __dirname;

describe('findTestPath', () => {
  it('finds path in rootDir', async () => {
    const path = await findTestPath({ name: 'findTestPath', rootDir });
    expect(relative(rootDir, path)).toEqual('findTestPath.test.ts');
  });

  it('finds path in a subfolder', async () => {
    const parentDir = join(__dirname, '../');
    const path = await findTestPath({
      name: 'findTestPath',
      rootDir: parentDir,
    });
    expect(relative(parentDir, path).replace(/\\/g, '/')).toEqual(
      'run/findTestPath.test.ts',
    );
  });

  it('finds an absolute path', async () => {
    const path = await findTestPath({
      name: __filename,
      rootDir,
    });
    expect(path).toEqual(__filename);
  });

  it('throws an error if not a file', async () => {
    await expect(
      findTestPath({
        name: rootDir,
        rootDir,
      }),
    ).rejects.toMatchInlineSnapshot(`[Error: No files match "${rootDir}"]`);
  });

  it('throws an error if multiple matching files', async () => {
    await expect(
      findTestPath({
        name: 'test',
        rootDir,
      }),
    ).rejects.toMatchInlineSnapshot(`[Error: Multiple files match "test"]`);
  });

  it('throws an error if no matching files', async () => {
    await expect(
      findTestPath({
        name: 'mytest',
        rootDir,
      }),
    ).rejects.toMatchInlineSnapshot(`[Error: No files match "mytest"]`);
  });
});
