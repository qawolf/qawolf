import { resolve } from 'path';
import { getCodePath } from '../../src/create-code/create';

describe('getCodePath', () => {
  it('finds the caller file with "await qawolf.create"', async () => {
    const path = await getCodePath();
    expect(resolve(path)).toEqual(resolve(__filename));
  });
});
