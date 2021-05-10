import { updateTagTriggersResolver } from "../../../server/resolvers/tag_trigger";
import { TagTrigger } from "../../../server/types";
import { prepareTestDb } from "../db";
import {
  buildTag,
  buildTagTrigger,
  buildTeam,
  buildTeamUser,
  buildTrigger,
  buildUser,
  testContext,
} from "../utils";

const db = prepareTestDb();
const context = { ...testContext, db };
const teams = [buildTeam({}), buildTeam({ i: 2 })];

beforeAll(async () => {
  await db("teams").insert([buildTeam({}), buildTeam({ i: 2 })]);
  await db("users").insert(buildUser({}));
  await db("team_users").insert([
    buildTeamUser({}),
    buildTeamUser({ i: 2, team_id: "team2Id" }),
  ]);

  await db("tags").insert([
    buildTag({}),
    buildTag({ i: 2 }),
    buildTag({ i: 3, team_id: "team2Id" }),
  ]);

  await db("triggers").insert([
    buildTrigger({}),
    buildTrigger({ i: 2, team_id: "team2Id" }),
  ]);
});

describe("updateTagTriggersResolver", () => {
  beforeAll(() => db("tag_triggers").insert(buildTagTrigger({})));

  afterAll(() => db("tag_triggers").del());

  it("updates tags for a trigger", async () => {
    const tagTriggers = await updateTagTriggersResolver(
      {},
      { tag_ids: ["tag2Id"], trigger_id: "triggerId" },
      context
    );

    expect(tagTriggers).toMatchObject([
      {
        tag_id: "tag2Id",
        trigger_id: "triggerId",
      },
    ]);

    const dbTagTriggers = await db("tag_triggers");
    expect(dbTagTriggers).toMatchObject([
      {
        tag_id: "tag2Id",
        trigger_id: "triggerId",
      },
    ]);
  });

  it("throws an error if trying to add tags for multiple teams", async () => {
    await expect(
      (): Promise<TagTrigger[]> => {
        return updateTagTriggersResolver(
          {},
          { tag_ids: ["tagId", "tag3Id"], trigger_id: "triggerId" },
          { ...context, teams }
        );
      }
    ).rejects.toThrowError("cannot add tags from another team");
  });
});
