import { outputJson, pathExists, readJson, remove } from "fs-extra";
import { SelectorFile } from "../src/SelectorFile";

// require manually since fs is mocked
const scrollLogin = require("@qawolf/test/workflows/scroll_login.json");

jest.mock("fs-extra");

const mockedPathExists = pathExists as jest.Mock;
const mockedReadJson = readJson as jest.Mock;
const mockedRemove = remove as jest.Mock;
const mockedOutputJson = outputJson as jest.Mock;

const options = {
  path: "/path/to/selectors.json"
};

describe("SelectorFile", () => {
  describe("preexisting selectors", () => {
    let file: SelectorFile;
    let preexisting = [{ css: "" }, { css: "" }];

    beforeAll(async () => {
      mockedPathExists.mockResolvedValueOnce(true);
      mockedReadJson.mockResolvedValueOnce(preexisting);
      mockedRemove.mockReset();
      mockedOutputJson.mockReset();
      file = await SelectorFile.loadOrCreate(options);
    });

    it("loadOrCreate: loads preexisting selectors", () => {
      expect(file._preexistingSelectors).toEqual(preexisting);
      expect(mockedOutputJson.mock.calls.length).toEqual(0);
    });

    it("hasPreexisting: returns true", () => {
      expect(file.hasPreexisting()).toEqual(true);
    });

    it("discard: reverts to preexisting selectors", async () => {
      await file.discard();
      expect(mockedRemove.mock.calls.length).toEqual(0);
      expect(mockedOutputJson.mock.calls.length).toEqual(1);
      expect(mockedOutputJson.mock.calls[0][1]).toEqual(preexisting);
    });
  });

  describe("no preexisting selectors", () => {
    let file: SelectorFile;

    beforeAll(async () => {
      mockedOutputJson.mockReset();
      file = await SelectorFile.loadOrCreate(options);
    });

    it("loadOrCreate: creates selectors", () => {
      expect(mockedOutputJson.mock.calls.length).toEqual(1);
      expect(mockedOutputJson.mock.calls[0]).toMatchSnapshot();
    });

    it("hasPreexisting: returns false", () => {
      expect(file.hasPreexisting()).toEqual(false);
    });

    it("discard: deletes the selectors file", async () => {
      mockedRemove.mockReset();
      mockedOutputJson.mockReset();
      await file.discard();
      expect(mockedRemove.mock.calls.length).toEqual(1);
      expect(mockedOutputJson.mock.calls.length).toEqual(0);
    });
  });

  describe("update", () => {
    it("saves the preexisting and new selectors", async () => {
      mockedOutputJson.mockReset();

      const file = await SelectorFile.loadOrCreate(options);

      await file.update({
        steps: scrollLogin.steps.slice(0, 2)
      });

      const fileRevisionOne = mockedOutputJson.mock.calls[1][1];
      expect(fileRevisionOne).toMatchSnapshot();

      await file.update({
        steps: scrollLogin.steps
      });

      const fileRevisionTwo = mockedOutputJson.mock.calls[2][1];
      expect(fileRevisionTwo).toMatchSnapshot();
    });
  });
});
