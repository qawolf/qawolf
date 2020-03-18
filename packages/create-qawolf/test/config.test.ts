import { detectTypeScript } from '../src/config';

test('detectTypeScript detects TypeScript', async () => {
  expect(await detectTypeScript()).toEqual(true);
});
