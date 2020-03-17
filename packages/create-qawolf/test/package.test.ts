import { getPackage } from '../src/package';

describe('getPackage', () => {
  it('loads the package.json if it exists', () => {
    expect(getPackage()).toEqual(null);
  });
});
