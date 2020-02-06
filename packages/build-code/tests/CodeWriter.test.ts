import { Step } from "@qawolf/types";
import { htmlToDoc } from "@qawolf/web";
import { CodeWriter, CodeWriterOptions } from "../src/CodeWriter";
import {
  outputFile,
  outputJson,
  pathExists,
  readFile,
  readJson,
  remove
} from "fs-extra";
import { buildInitialCode } from "../src/buildInitialCode";
import { CREATE_CODE_SYMBOL, CodeUpdater } from "../src/CodeUpdater";

jest.mock("fs-extra");

jest.mock("../src/CodeUpdater");

const mockedPathExists = pathExists as jest.Mock;
const mockedReadFile = readFile as jest.Mock;
const mockedReadJson = readJson as jest.Mock;
const mockedRemove = remove as jest.Mock;
const mockedOutputFile = outputFile as jest.Mock;
const mockedOutputJson = outputJson as jest.Mock;

const options: CodeWriterOptions = {
  codePath: "/path/tests/mytest.test.js",
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
      mockedPathExists.mockResolvedValueOnce(false);

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

  describe("existing code and selectors", () => {
    it("does not write initial code", async () => {
      mockedOutputFile.mockClear();
      mockedPathExists.mockResolvedValue(true);

      await CodeWriter.start(options);

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
    mockedReadFile.mockResolvedValueOnce("no code");

    const writer = await CodeWriter.start(options);

    const consoleSpy = jest.spyOn(global.console, "log").mockImplementation();
    await writer._loadUpdatableCode();

    expect(consoleSpy.mock.calls[0]).toEqual([
      "\n",
      "[1m[31mCannot update code without this line:[22m[39m",
      CREATE_CODE_SYMBOL
    ]);

    consoleSpy.mockRestore();
  });
});

describe("CodeWriter._updateCode", () => {
  it("includes existing selecrors", () => {
    // TODO
  });

  it("updates code and selectors", async () => {
    const writer = await CodeWriter.start(options);

    // make it updatable
    // - there is code
    mockedReadFile.mockResolvedValueOnce(CREATE_CODE_SYMBOL);
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
  it("restores preexisting code and selectors", async () => {
    let preexistingCode = "preexistingCode()";
    let prexistingSelectors = [{}];

    mockedOutputFile.mockReset();
    mockedOutputJson.mockReset();

    mockedPathExists.mockResolvedValue(true);

    mockedReadFile.mockResolvedValueOnce(preexistingCode);
    mockedReadJson.mockResolvedValueOnce(prexistingSelectors);

    const writer = await CodeWriter.start(options);

    expect(writer._preexistingCode).toEqual(preexistingCode);
    expect(writer._preexistingSelectors).toEqual(prexistingSelectors);

    await writer.discard();

    expect(mockedRemove.mock.calls.length).toEqual(0);

    expect(mockedOutputFile.mock.calls[0]).toEqual([
      options.codePath,
      preexistingCode,
      "utf8"
    ]);

    expect(mockedOutputJson.mock.calls[0]).toEqual([
      "/path/selectors/mytest.json",
      prexistingSelectors,
      { spaces: " " }
    ]);
  });

  it("deletes new code and selectors", async () => {
    mockedPathExists.mockResolvedValue(false);

    const writer = await CodeWriter.start(options);
    expect(writer._preexistingCode).toEqual(undefined);
    expect(writer._preexistingSelectors).toEqual(undefined);

    mockedRemove.mockReset();
    await writer.discard();

    expect(mockedRemove.mock.calls.length).toEqual(2);
    expect(mockedRemove.mock.calls[0]).toEqual([options.codePath]);
    expect(mockedRemove.mock.calls[1]).toEqual(["/path/selectors/mytest.json"]);
  });
});

describe("CodeWriter.save", () => {
  it("saves the final code", async () => {
    // TODO
  });

  it("logs how to run code", () => {
    // TODO
  });
});
