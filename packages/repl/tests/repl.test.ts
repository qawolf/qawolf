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
    expect(mockStdout.mock.calls.map(a => a[0])).toMatchInlineSnapshot(`
      Array [
        "[999D[K",
        "  [2mconsole.log[22m [2msrc/repl.ts:510[22m
          [1m[33mType .exit or resume() to close the repl[22m[39m

      ",
        "[1G",
        "[0J",
        "> ",
        "[3G",
      ]
    `);
  });

  test("resolves after resume() is called", () => {
    expect(resolved).toEqual(false);
    replServer.context.resume().then(() => {
      expect(resolved).toEqual(true);
    });
  });
});
