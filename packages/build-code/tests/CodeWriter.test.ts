import { CodeWriter, CodeWriterOptions } from "../src/CodeWriter";
import { outputFile, pathExists, readFile } from "fs-extra";
import { buildInitialCode } from "../src/buildInitialCode";
import { CREATE_CODE_SYMBOL } from "../src/CodeUpdater";

jest.mock("fs-extra");

const mockedPathExists = pathExists as jest.Mock<Promise<boolean>>;
const mockedOutputFile = outputFile as jest.Mock<Promise<void>>;

const options: CodeWriterOptions = {
  codePath: "/path/to/mytest.test.js",
  isTest: true,
  name: "mytest",
  url: "http://localhost:3000"
};

describe("CodeWriter._createInitialCode", () => {
  describe("no existing code", () => {
    it("writes initial code", async () => {
      mockedPathExists.mockResolvedValue(false);

      const writer = await CodeWriter.start(options);
      expect(mockedOutputFile.mock.calls[0]).toEqual([
        options.codePath,
        buildInitialCode({
          ...options,
          createCodeSymbol: CREATE_CODE_SYMBOL
        }),
        "utf8"
      ]);
      writer.dispose();
    });
  });

  describe("existing code", () => {
    it("does not write initial code", async () => {
      mockedPathExists.mockResolvedValue(true);
      mockedOutputFile.mockClear();

      const writer = await CodeWriter.start(options);
      expect(mockedOutputFile.mock.calls.length).toEqual(0);
      writer.dispose();
    });

    it("inserts the create symbol for scripts", () => {
      // TODO
    });

    it("inserts the create symbol for tests", () => {
      // TODO
    });
  });
});

describe("CodeWriter._loadUpdatableCode", () => {
  it("logs when the create symbol is not found", async () => {
    const mockedReadFile = readFile as jest.Mock<
      Promise<string | number | Buffer>
    >;
    mockedReadFile.mockResolvedValue("no code");

    const writer = await CodeWriter.start(options);

    const consoleSpy = jest.spyOn(global.console, "log").mockImplementation();
    await writer._loadUpdatableCode();

    writer.dispose();

    expect(consoleSpy.mock.calls[0]).toEqual([
      "[1m[31mCannot update code without this line:[22m[39m",
      CREATE_CODE_SYMBOL
    ]);

    consoleSpy.mockRestore();
  });
});

describe("CodeWriter._updateCode", () => {
  it("updates code", () => {
    // TODO
  });

  it("updates selectors", () => {
    // TODO
  });
});

describe("CodeWriter.discard", () => {
  it("restores the existing code", () => {
    // TODO
  });

  it("deletes the file if there was not existing code", () => {
    // TODO
  });
});

describe("CodeWriter.save", () => {
  it("includes non-final steps", () => {
    // TODO
  });

  it("removes the CREATE_CODE_SYMBOL", () => {
    // TODO
  });
});
