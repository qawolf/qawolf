import {
  buildFileUrl,
  createFile,
  deleteFile,
  findClosestUrl,
  findFile,
} from "../../../server/models/file";
import { prepareTestDb } from "../db";
import { buildFile, createRunnerLocations, logger } from "../utils";

const db = prepareTestDb();
const options = { db, logger };

describe("buildFileUrl", () => {
  beforeAll(async () => {
    await createRunnerLocations(db);
    return db("files").insert(buildFile({}));
  });

  afterAll(async () => {
    await db("environment_variables").del();
    return db("files").del();
  });

  it("returns existing file url if possible", async () => {
    const url = await buildFileUrl({ id: "fileId", ip: null }, options);
    const files = await db("files");

    expect(url).toBe("fileUrl");
    expect(files).toMatchObject([{ id: "fileId" }]);
  });

  it("creates a new file otherwise", async () => {
    const url = await buildFileUrl({ id: "newFileId", ip: null }, options);
    const files = await db("files").orderBy("created_at", "asc");

    expect(url).toBe("wss://eastus2.qawolf.com");
    expect(files).toMatchObject([{ id: "fileId" }, { id: "newFileId", url }]);
  });
});

describe("createFile", () => {
  afterEach(() => db("files").del());

  it("creates a file", async () => {
    const file = await createFile({ id: "fileId", url: "fileUrl" }, options);

    expect(file).toMatchObject({
      created_at: expect.any(Date),
      id: "fileId",
      url: "fileUrl",
    });
  });
});

describe("deleteFile", () => {
  it("deletes a file", async () => {
    await db("files").insert(buildFile({}));

    const file = await deleteFile("fileId", options);
    const dbFile = await db("files").first();

    expect(file.id).toBe("fileId");
    expect(dbFile).toBeFalsy();
  });
});

describe("findClosestUrl", () => {
  afterEach(() => db("environment_variables").del());

  it("returns closest url for https", async () => {
    await createRunnerLocations(db);

    const url = await findClosestUrl(null, options);

    expect(url).toBe("wss://eastus2.qawolf.com");
  });

  it("returns closest url for http", async () => {
    await createRunnerLocations(db, false);

    const url = await findClosestUrl(null, options);

    expect(url).toBe("ws://eastus2.qawolf.com");
  });
});

describe("findFile", () => {
  beforeAll(() => db("files").insert(buildFile({})));

  afterAll(() => db("files").del());

  it("finds a file", async () => {
    const file = await findFile("fileId", options);

    expect(file).toMatchObject({ id: "fileId" });
  });

  it("returns null if file not found", async () => {
    const file = await findFile("fakeId", options);

    expect(file).toBeNull();
  });
});
