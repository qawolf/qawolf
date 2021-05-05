import {
  createTag,
  deleteTag,
  findTag,
  findTagsForTeam,
  updateTag,
} from "../../../server/models/tag";
import { Tag } from "../../../server/types";
import { prepareTestDb } from "../db";
import {
  buildTag,
  buildTagTest,
  buildTeam,
  buildTest,
  buildUser,
  logger,
} from "../utils";

const db = prepareTestDb();
const options = { db, logger };

beforeAll(async () => {
  await db("users").insert(buildUser({}));
  await db("teams").insert([buildTeam({}), buildTeam({ i: 2 })]);

  return db("tests").insert(buildTest({}));
});

describe("tag model", () => {
  describe("createTag", () => {
    afterEach(() => db("tags").del());

    it("creates a new tag", async () => {
      const tag = await createTag(
        { name: "tag name", team_id: "teamId" },
        options
      );

      const dbTag = await db("tags").first();

      expect(tag).toMatchObject({ color: "#4545E5", name: "tag name" });
      expect(dbTag).toMatchObject(tag);
    });

    it("throws an error if tag name taken", async () => {
      await db("tags").insert(buildTag({ name: "taken" }));

      await expect(
        (async (): Promise<Tag> => {
          return createTag({ name: "taken", team_id: "teamId" }, options);
        })()
      ).rejects.toThrowError("name must be unique");
    });

    it("throws an error if comma in tag name", async () => {
      await expect(
        (async (): Promise<Tag> => {
          return createTag({ name: "this,that", team_id: "teamId" }, options);
        })()
      ).rejects.toThrowError("cannot include commas");
    });
  });

  describe("deleteTag", () => {
    beforeEach(() => db("tags").insert(buildTag({})));

    afterEach(() => db("tags").del());

    it("deletes a tag", async () => {
      await db("tag_tests").insert(buildTagTest({}));

      const tag = await deleteTag("tagId", { db, logger });
      expect(tag).toMatchObject({ id: "tagId" });

      const dbTag = await db("tags").where({ id: "tagId" }).first();
      expect(dbTag).toBeFalsy();

      const tagTest = await db("tag_tests").first();
      expect(tagTest).toBeFalsy();
    });
  });

  describe("findTag", () => {
    beforeAll(() => db("tags").insert(buildTag({})));

    afterAll(() => db("tags").del());

    it("finds a tag", async () => {
      const tag = await findTag("tagId", { db, logger });

      expect(tag).toMatchObject({ id: "tagId" });
    });

    it("throws an error if tag not found", async () => {
      await expect(
        (async () => {
          return findTag("fakeId", { db, logger });
        })()
      ).rejects.toThrowError("not found");
    });
  });

  describe("findTagsForTeam", () => {
    beforeAll(() => {
      return db("tags").insert([
        buildTag({ name: "B Tag" }),
        buildTag({ i: 2, name: "A Tag" }),
        buildTag({ i: 3, team_id: "team2Id" }),
      ]);
    });

    afterAll(() => db("tags").del());

    it("finds tags for a team", async () => {
      const tags = await findTagsForTeam("teamId", options);

      expect(tags).toMatchObject([{ name: "A Tag" }, { name: "B Tag" }]);
    });
  });

  describe("updateTag", () => {
    beforeAll(() => {
      return db("tags").insert([
        buildTag({}),
        buildTag({ i: 2, name: "Taken" }),
      ]);
    });

    afterAll(() => db("tags").del());

    it("updates a tag name", async () => {
      const tag = await updateTag({ id: "tagId", name: "New name" }, options);

      expect(tag.name).toBe("New name");
      expect(tag.created_at).not.toBe(tag.updated_at);

      const dbTag = await db("tags").where({ id: "tagId" }).first();

      expect(dbTag).toMatchObject({
        ...tag,
        updated_at: new Date(tag.updated_at),
      });

      await db("tags")
        .where({ id: "tagId" })
        .update({ name: buildTag({}).name });
    });

    it("throws an error if tag not found", async () => {
      await expect(
        (async (): Promise<Tag> => {
          return updateTag({ id: "fakeId", name: "New name" }, options);
        })()
      ).rejects.toThrowError("not found");
    });

    it("throws an error if tag name taken", async () => {
      await expect(
        (async (): Promise<Tag> => {
          return updateTag({ id: "tagId", name: "Taken" }, options);
        })()
      ).rejects.toThrowError("name must be unique");
    });

    it("throws an error if comma in tag name", async () => {
      await expect(
        (async (): Promise<Tag> => {
          return updateTag({ id: "tagId", name: "this,that" }, options);
        })()
      ).rejects.toThrowError("cannot include commas");
    });
  });
});
