import { buildHelpersForFiles } from "../../../../server/services/gitHub/tree";
import { prepareTestDb } from "../../db";
import { logger } from "../../utils";

const db = prepareTestDb();
const options = { db, logger };

describe("buildHelpersForFiles", () => {
  it("builds helpers from files", () => {
    expect(
      buildHelpersForFiles(
        [
          {
            path: "qawolf/helpers/index.js",
            sha: "helpersSha",
            text: "helpers",
          },
          {
            path: "qawolf/myTest.test.js",
            sha: "sha",
            text: "// code",
          },
        ],
        options
      )
    ).toBe("helpers");
  });

  it("throws an error if no helpers file", () => {
    expect(() => {
      return buildHelpersForFiles(
        [
          {
            path: "qawolf/myTest.test.js",
            sha: "sha",
            text: "// code",
          },
        ],
        options
      );
    }).toThrowError("not found");
  });
});
