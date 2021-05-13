import { updateTagTriggersForTrigger } from "../../../server/models/tag_trigger";
import { prepareTestDb } from "../db";
import {
  buildTag,
  buildTagTrigger,
  buildTeam,
  buildTrigger,
  buildUser,
  logger,
} from "../utils";

const db = prepareTestDb();
const options = { db, logger };

beforeAll(async () => {
  await db("users").insert(buildUser({}));
  await db("teams").insert(buildTeam({}));

  await db("tags").insert([
    buildTag({}),
    buildTag({ i: 2 }),
    buildTag({ i: 3 }),
  ]);

  return db("triggers").insert([buildTrigger({}), buildTrigger({ i: 2 })]);
});

describe("updateTagTriggersForTrigger", () => {
  afterEach(() => db("tag_triggers").del());

  it("adds and removes tags from a trigger", async () => {
    await db("tag_triggers").insert([
      buildTagTrigger({}),
      buildTagTrigger({ i: 2, tag_id: "tag3Id" }),
    ]);

    const tagTriggers = await updateTagTriggersForTrigger(
      { tag_ids: ["tagId", "tag2Id"], trigger_id: "triggerId" },
      options
    );

    expect(tagTriggers).toMatchObject([
      { tag_id: "tagId", trigger_id: "triggerId" },
      { tag_id: "tag2Id", trigger_id: "triggerId" },
    ]);

    const dbTagTriggers = await db("tag_triggers");

    expect(dbTagTriggers).toHaveLength(2);
  });

  it("clears tags from a trigger", async () => {
    await db("tag_triggers").insert([
      buildTagTrigger({}),
      buildTagTrigger({ i: 2, tag_id: "tag3Id" }),
    ]);

    const tagTriggers = await updateTagTriggersForTrigger(
      { tag_ids: [], trigger_id: "triggerId" },
      options
    );

    expect(tagTriggers).toEqual([]);

    const dbTagTriggers = await db("tag_triggers");

    expect(dbTagTriggers).toEqual([]);
  });
});
