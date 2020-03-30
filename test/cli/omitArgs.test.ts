import { omitArgs } from '../../src/cli/omitArgs';

it('omits args', () => {
  const args = omitArgs(['--omit=true', '--keep=true'], ['--omit']);
  expect(args).toEqual(['--keep=true']);
});
