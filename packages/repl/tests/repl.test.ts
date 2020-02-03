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
        "  [2mconsole.log[22m [2msrc/repl.ts:467[22m
          [1m[33mType .exit to close the repl and continue running your code[22m[39m

      ",
        "[1G",
        "[0J",
        "> ",
        "[3G",
      ]
    `);
  });

  test("resolves after resume() is called", async () => {
    expect(resolved).toEqual(false);
    replServer.close();
    await new Promise(r => setTimeout(r, 0));
    expect(resolved).toEqual(true);
  });
});
