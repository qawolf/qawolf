import { resolve, relative } from 'path';
import { getCodePath, getSelectorPath } from '../../src/create-code/create';

describe('getCodePath', () => {
  it('finds the caller file with "await qawolf.create"', async () => {
    const path = await getCodePath();
    expect(resolve(path)).toEqual(resolve(__filename));
  });
});

describe('getSelectorPath', () => {
  it('returns a sibling path for the code file', () => {
    const selectorPath = getSelectorPath(__filename);
    const relativePath = relative(__filename, selectorPath);
    expect(relativePath).toEqual('../../selectors/create.json');
  });
});
