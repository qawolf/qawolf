import { waitFor, waitUntil } from "@qawolf/web";

describe("waitFor", () => {
  it("supports async functions", async () => {
    const value = await waitFor(() => Promise.resolve(undefined), 0);
    expect(value).toEqual(null);
  });

  it("supports regular functions", async () => {
    const value = await waitFor(() => 5, 0);
    expect(value).toEqual(5);
  });
});

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
