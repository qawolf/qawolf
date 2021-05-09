import * as runnerResolvers from "../../../server/resolvers/runner";
import { prepareTestDb } from "../db";
import { buildTest, testContext } from "../utils";

const { runnerResolver } = runnerResolvers;

const db = prepareTestDb();
const context = { ...testContext, api_key: "apiKey", db };

beforeAll(async () => {
  await db("users").insert(context.user);
  await db("teams").insert(context.teams[0]);
});

describe("runnerResolver", () => {
  beforeAll(async () => {
    await db("tests").insert(buildTest({}));
  });

  afterAll(async () => {
    await db("tests").del();
  });

  it("returns a runner", async () => {
    const runner = await runnerResolver(null, { test_id: "testId" }, context);
    expect(runner).toEqual({
      vnc_url: "ws://localhost:5000",
      ws_url: "ws://localhost:4000/socket.io",
    });
  });
});
