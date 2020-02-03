import { mockProcessStdout } from "jest-mock-process";
import { REPLServer } from "repl";
import { repl } from "../src/repl";

describe("repl", () => {
  let replServer: REPLServer;
  let resolved = false;
  let mockStdout: jest.SpyInstance = mockProcessStdout();

  beforeAll(() => {
    repl({}, s => (replServer = s)).then(() => (resolved = true));
  });

  afterAll(() => {
    mockStdout.mockRestore();
  });

  test("opens a repl", () => {
    expect(
      mockStdout.mock.calls
        .map(a => a[0])
        .find((m: string) => m.includes("Type .exit to close the repl"))
    ).toBeTruthy();

    expect(
      mockStdout.mock.calls.map(a => a[0]).find((m: string) => m.includes("> "))
    ).toBeTruthy();
  });

  test("resolves after resume() is called", async () => {
    expect(resolved).toEqual(false);
    replServer.close();
    await new Promise(r => setTimeout(r, 0));
    expect(resolved).toEqual(true);
  });
});
