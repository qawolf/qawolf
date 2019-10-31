import { waitUntil } from "@qawolf/web";

describe("waitUntil", () => {
  it("calls function and exits when true is returned", async () => {
    const booleanFn = jest.fn();
    booleanFn.mockReturnValue(true);

    await waitUntil(booleanFn, { timeoutMs: 250 });

    expect(booleanFn).toBeCalledTimes(1);
  });

  it("throws error if condition never met", async () => {
    const testFn = async () => {
      await waitUntil(() => false, { timeoutMs: 250 });
    };

    await expect(testFn()).rejects.toThrowError();
  });
});
