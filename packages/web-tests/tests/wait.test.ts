import { waitUntil } from "@qawolf/web";

describe("waitUntil", () => {
  it("calls predicate and exits when true is returned", async () => {
    const predicate = jest.fn();
    predicate.mockReturnValue(true);

    await waitUntil(predicate, 0);
    await waitUntil(predicate, 250);

    expect(predicate).toBeCalledTimes(2);
  });

  it("throws error if condition never met", async () => {
    const testFn = async () => {
      await waitUntil(() => false, 250);
    };

    await expect(testFn()).rejects.toThrowError();
  });
});
