import { buildSteps } from "@qawolf/build-workflow";
import { outputFile, pathExists, readFile, remove } from "fs-extra";
import { CodeFile, CodeFileOptions } from "../src/CodeFile";

// require manually since fs is mocked
const events = require("@qawolf/test/events/scroll_login.json");

jest.mock("fs-extra");

const mockedPathExists = pathExists as jest.Mock;
const mockedReadFile = readFile as jest.Mock;
const mockedRemove = remove as jest.Mock;
const mockedOutputFile = outputFile as jest.Mock;

const options: CodeFileOptions = {
  path: "/path/tests/mytest.test.js",
  isTest: true,
  name: "mytest",
  url: "http://localhost:3000"
};

describe("CodeFile", () => {
  describe("preexisting code", () => {
    let file: CodeFile;
    let preexisting = "preexistingCode()";

    beforeAll(async () => {
      mockedPathExists.mockResolvedValueOnce(true);
      mockedReadFile.mockResolvedValueOnce(preexisting);
      mockedRemove.mockReset();
      mockedOutputFile.mockReset();
      file = await CodeFile.loadOrCreate(options);
    });

    it("loadOrCreate: loads preexisting code", () => {
      expect(file._preexisting).toEqual(preexisting);
    });

    it("hasPreexisting: returns true", () => {
      expect(file.hasPreexisting()).toEqual(true);
    });

    it("discard: reverts to preexisting code", async () => {
      await file.discard();
      expect(mockedRemove.mock.calls.length).toEqual(0);
      expect(mockedOutputFile.mock.calls.length).toEqual(1);
      expect(mockedOutputFile.mock.calls[0]).toEqual([
        options.path,
        preexisting,
        "utf8"
      ]);
    });
  });

  describe("no preexisting code", () => {
    let file: CodeFile;

    beforeAll(async () => {
      mockedOutputFile.mockReset();
      file = await CodeFile.loadOrCreate(options);
    });

    it("loadOrCreate: creates initial code", () => {
      expect(mockedOutputFile.mock.calls.length).toEqual(1);
      expect(mockedOutputFile.mock.calls[0]).toMatchSnapshot();
    });

    it("hasPreexisting: returns false", () => {
      expect(file.hasPreexisting()).toEqual(false);
    });

    it("discard: deletes the code file", async () => {
      mockedRemove.mockReset();
      mockedOutputFile.mockReset();
      await file.discard();
      expect(mockedRemove.mock.calls.length).toEqual(1);
      expect(mockedOutputFile.mock.calls.length).toEqual(0);
    });
  });

  describe("update", () => {
    it("saves code with new steps", async () => {
      // use the three pages events to test multiple page tests works properly
      const steps = buildSteps({ events });
      mockedOutputFile.mockReset();

      const file = await CodeFile.loadOrCreate(options);

      mockedPathExists.mockResolvedValue(true);

      const initialFile = mockedOutputFile.mock.calls[0][1];
      mockedReadFile.mockResolvedValueOnce(initialFile);

      await file.update({
        // emulate only the first two steps being ready
        steps: steps.slice(0, 2)
      });

      const fileRevisionOne = mockedOutputFile.mock.calls[1][1];
      expect(fileRevisionOne).toMatchSnapshot();
      mockedReadFile.mockResolvedValueOnce(fileRevisionOne);

      await file.update({
        removeHandle: true,
        steps: steps
      });

      const fileRevisionTwo = mockedOutputFile.mock.calls[2][1];
      expect(fileRevisionTwo).toMatchSnapshot();
    });
  });
});
