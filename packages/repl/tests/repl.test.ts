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
    const messages: string[] = mockStdout.mock.calls.map(args => args[0]);

    expect(
      messages.find((m: string) => m.includes("Type .exit to close the repl"))
    ).toBeTruthy();

    expect(messages).toContain("> ");
  });

  test("resolves after resume() is called", async () => {
    expect(resolved).toEqual(false);
    replServer.close();
    await new Promise(r => setTimeout(r, 0));
    expect(resolved).toEqual(true);
  });
});
