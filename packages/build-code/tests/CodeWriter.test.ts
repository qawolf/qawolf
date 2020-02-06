import { Step } from "@qawolf/types";
import { htmlToDoc } from "@qawolf/web";
import { CodeWriter, CodeWriterOptions } from "../src/CodeWriter";
import { outputFile, outputJSON, pathExists, readFile, remove } from "fs-extra";
import { buildInitialCode } from "../src/buildInitialCode";
import { CREATE_CODE_SYMBOL, CodeUpdater } from "../src/CodeUpdater";

jest.mock("fs-extra");

jest.mock("../src/CodeUpdater");

const mockedPathExists = pathExists as jest.Mock<Promise<boolean>>;
const mockedReadFile = readFile as jest.Mock<Promise<string | number | Buffer>>;
const mockedRemove = remove as jest.Mock<Promise<void>>;
const mockedOutputFile = outputFile as jest.Mock<Promise<void>>;
const mockedOutputJson = outputJSON as jest.Mock<Promise<void>>;

const options: CodeWriterOptions = {
  codePath: "/path/to/mytest.test.js",
  isTest: true,
  name: "mytest",
  url: "http://localhost:3000"
};

const step: Step = {
  action: "click",
  html: {
    ancestors: [],
    node: htmlToDoc("<input />")
  },
  index: 0,
  isFinal: true,
  page: 0
};

describe("CodeWriter._createInitialCode", () => {
  describe("no preexisting code", () => {
    it("writes initial code", async () => {
      mockedOutputFile.mockClear();
      mockedPathExists.mockResolvedValue(false);

      await CodeWriter.start(options);
      expect(mockedOutputFile.mock.calls[0]).toEqual([
        options.codePath,
        buildInitialCode({
          ...options,
          createCodeSymbol: CREATE_CODE_SYMBOL
        }),
        "utf8"
      ]);
    });
  });

  describe("existing code", () => {
    it("does not write initial code", async () => {
      mockedOutputFile.mockClear();
      mockedPathExists.mockResolvedValue(true);

      const writer = await CodeWriter.start(options);
      expect(mockedOutputFile.mock.calls.length).toEqual(0);
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
    mockedReadFile.mockResolvedValue("no code");

    const writer = await CodeWriter.start(options);

    const consoleSpy = jest.spyOn(global.console, "log").mockImplementation();
    await writer._loadUpdatableCode();

    expect(consoleSpy.mock.calls[0]).toEqual([
      "[1m[31mCannot update code without this line:[22m[39m",
      CREATE_CODE_SYMBOL
    ]);

    consoleSpy.mockRestore();
  });
});

describe("CodeWriter._updateCode", () => {
  it("updates code and selectors", async () => {
    const writer = await CodeWriter.start(options);

    // make it updatable
    // - there is code
    mockedReadFile.mockResolvedValue(CREATE_CODE_SYMBOL);
    // - the code has an update symbol
    (CodeUpdater.hasCreateSymbol as jest.Mock).mockReturnValue(true);
    // - there are pending steps
    (writer._updater.getNumPendingSteps as jest.Mock<number>).mockReturnValue(
      1
    );

    // mock what the updated code should be
    let expected = "SOME UPDATED CODE";
    (writer._updater.updateCode as jest.Mock).mockReturnValue(expected);

    writer._updater._steps = [step];

    mockedOutputFile.mockClear();
    mockedOutputJson.mockClear();

    // run the update
    await writer._updateCode();

    expect(mockedOutputFile.mock.calls[0]).toEqual([
      options.codePath,
      expected,
      "utf8"
    ]);

    expect(mockedOutputJson.mock.calls[0]).toMatchSnapshot();
  });
});

describe("CodeWriter.discard", () => {
  it("restores preexisting code", async () => {
    let preexistingCode = "preexistingCode()";

    mockedOutputFile.mockReset();
    mockedPathExists.mockResolvedValue(true);
    mockedReadFile.mockResolvedValue(preexistingCode);

    const writer = await CodeWriter.start(options);
    expect(writer._preexistingCode).toEqual(preexistingCode);

    await writer.discard();

    expect(mockedOutputFile.mock.calls[0]).toEqual([
      options.codePath,
      preexistingCode,
      "utf8"
    ]);
    expect(mockedRemove.mock.calls.length).toEqual(0);
  });

  it("deletes the file if there was not preexisting code", async () => {
    mockedPathExists.mockResolvedValue(false);

    const writer = await CodeWriter.start(options);
    expect(writer._preexistingCode).toEqual(undefined);

    mockedRemove.mockReset();
    await writer.discard();
    expect(mockedRemove.mock.calls[0]).toEqual([options.codePath]);
  });
});

describe("CodeWriter.save", () => {
  it("includes non-final steps", async () => {
    // TODO
  });

  it("removes the CREATE_CODE_SYMBOL", () => {
    // TODO
  });
});
