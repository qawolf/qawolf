import { waitFor } from '../../src/utils';

describe('waitFor', () => {
  it('supports async functions', async () => {
    const value = await waitFor(() => Promise.resolve(5), {
      timeout: 0,
    });
    expect(value).toEqual(5);
  });

  it('supports regular functions', async () => {
    const value = await waitFor(() => 5, {
      timeout: 0,
    });
    expect(value).toEqual(5);
  });

  it('times out when nothing truthy is resolved', async () => {
    await expect(
      waitFor(() => false, {
        timeout: 0,
      }),
    ).rejects.toEqual('waitFor timed out after 0ms');
  });
});
