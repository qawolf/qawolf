/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextApiRequest } from "next";

import { handleSuitesRequest } from "../../../../server/api/suites";
import { decrypt } from "../../../../server/models/encrypt";
import { prepareTestDb } from "../../db";
import {
  buildEnvironment,
  buildEnvironmentVariable,
  buildTag,
  buildTagTest,
  buildTeam,
  buildTest,
  buildTrigger,
  buildUser,
  logger,
} from "../../utils";

const send = jest.fn();
const status = jest.fn().mockReturnValue({ send });
const res = { status };

const db = prepareTestDb();

describe("handleSuitesRequest", () => {
  beforeAll(async () => {
    await db("users").insert(buildUser({}));
    await db("teams").insert(buildTeam({ apiKey: "qawolf_api_key" }));

    await db("environments").insert(buildEnvironment({}));
    await db("environment_variables").insert(buildEnvironmentVariable({}));

    await db("triggers").insert({
      ...buildTrigger({ environment_id: "environmentId" }),
      id: "tagId",
    });

    await db("tests").insert([buildTest({}), buildTest({ i: 2 })]);

    await db("tags").insert([
      buildTag({}),
      buildTag({ i: 2 }),
      buildTag({ i: 3 }),
    ]);

    await db("tag_tests").insert([
      buildTagTest({}),
      buildTagTest({ i: 2, tag_id: "tag2Id", test_id: "test2Id" }),
    ]);
  });

  afterEach(() => jest.clearAllMocks());

  afterAll(async () => {
    jest.restoreAllMocks();

    await db.del();
  });

  it("returns 401 if api key not provided", async () => {
    await handleSuitesRequest(
      { body: {}, headers: {} } as NextApiRequest,
      res as any,
      { db, logger }
    );

    expect(status).toBeCalledWith(401);
    expect(send).toBeCalledWith("No API key provided");
  });

  it("returns 403 if invalid api key", async () => {
    await handleSuitesRequest(
      {
        body: {},
        headers: { authorization: "invalid" },
      } as NextApiRequest,
      res as any,
      { db, logger }
    );

    expect(status).toBeCalledWith(403);
    expect(send).toBeCalledWith("API key cannot create suite");
  });

  it("returns 403 if plan limit reached", async () => {
    await db("teams").update({ limit_reached_at: new Date().toISOString() });

    await handleSuitesRequest(
      {
        body: {},
        headers: { authorization: "qawolf_api_key" },
      } as NextApiRequest,
      res as any,
      { db, logger }
    );

    expect(status).toBeCalledWith(403);
    expect(send).toBeCalledWith("Plan limit reached");

    await db("teams").update({ limit_reached_at: null });
  });

  it("returns 500 if no tests found for tags", async () => {
    await handleSuitesRequest(
      {
        body: { tags: "tag3" },
        headers: { authorization: "qawolf_api_key" },
      } as NextApiRequest,
      res as any,
      { db, logger }
    );

    expect(status).toBeCalledWith(500);
    expect(send).toBeCalledWith("No tests found");
  });

  it("returns 500 if no tests found for trigger", async () => {
    await handleSuitesRequest(
      {
        body: { trigger_id: "tag3Id" },
        headers: { authorization: "qawolf_api_key" },
      } as NextApiRequest,
      res as any,
      { db, logger }
    );

    expect(status).toBeCalledWith(500);
    expect(send).toBeCalledWith("No tests found");
  });

  it("returns 500 if environment ambiguous", async () => {
    await db("environments").insert(
      buildEnvironment({ i: 2, name: "Production" })
    );

    await handleSuitesRequest(
      {
        body: { tags: "tag1" },
        headers: { authorization: "qawolf_api_key" },
      } as NextApiRequest,
      res as any,
      { db, logger }
    );

    expect(status).toBeCalledWith(500);
    expect(send).toBeCalledWith("Must provide environment name");

    await db("environments").where({ id: "environment2Id" }).del();
  });

  it("creates a suite and returns url if env variables passed as JSON", async () => {
    await handleSuitesRequest(
      {
        body: { env: { secret: "shh" } },
        headers: { authorization: "qawolf_api_key" },
      } as NextApiRequest,
      res as any,
      { db, logger }
    );

    expect(status).toBeCalledWith(200);
    const suite = await db.select("*").from("suites").first();
    expect(suite).toMatchObject({
      environment_id: "environmentId",
      is_api: true,
      trigger_id: null,
    });

    expect(send).toBeCalledWith({ id: suite.id, url: expect.any(String) });

    expect(send.mock.calls[0][0].url).toMatch(`/suites/${suite.id}`);
    expect(JSON.parse(decrypt(suite.environment_variables))).toEqual({
      secret: "shh",
    });

    const runs = await db("runs").where({ suite_id: suite.id });
    expect(runs).toMatchObject([{ test_id: "testId" }, { test_id: "test2Id" }]);

    await db("runs").del();
    await db("suites").del();
  });

  it("creates a suite and returns url if env variables passed as string", async () => {
    await handleSuitesRequest(
      {
        body: {
          env: JSON.stringify({ secret: "shh" }),
          trigger_id: "tagId",
        },
        headers: { authorization: "qawolf_api_key" },
      } as NextApiRequest,
      res as any,
      { db, logger }
    );

    expect(status).toBeCalledWith(200);

    const suite = await db.select("*").from("suites").first();
    expect(suite).toMatchObject({
      environment_id: "environmentId",
      is_api: true,
      trigger_id: null,
    });

    expect(JSON.parse(decrypt(suite.environment_variables))).toEqual({
      secret: "shh",
    });

    const runs = await db("runs").where({ suite_id: suite.id });
    expect(runs).toMatchObject([{ test_id: "testId" }]);

    await db("runs").del();
    await db("suites").del();
  });

  it("creates a suite and returns url for tag names", async () => {
    await handleSuitesRequest(
      {
        body: {
          env: JSON.stringify({ secret: "shh" }),
          env_name: "Staging",
          tags: "tag1",
        },
        headers: { authorization: "qawolf_api_key" },
      } as NextApiRequest,
      res as any,
      { db, logger }
    );

    expect(status).toBeCalledWith(200);

    const suite = await db.select("*").from("suites").first();
    expect(suite).toMatchObject({
      environment_id: "environmentId",
      is_api: true,
      trigger_id: null,
    });

    expect(JSON.parse(decrypt(suite.environment_variables))).toEqual({
      secret: "shh",
    });

    const runs = await db("runs").where({ suite_id: suite.id });
    expect(runs).toMatchObject([{ test_id: "testId" }]);

    await db("runs").del();
    await db("suites").del();
  });

  it("creates a suite and returns url with default environment", async () => {
    await handleSuitesRequest(
      {
        body: {
          env: JSON.stringify({ secret: "shh" }),
          tags: "tag1",
        },
        headers: { authorization: "qawolf_api_key" },
      } as NextApiRequest,
      res as any,
      { db, logger }
    );

    expect(status).toBeCalledWith(200);

    const suite = await db.select("*").from("suites").first();
    expect(suite).toMatchObject({
      environment_id: "environmentId",
      is_api: true,
      trigger_id: null,
    });

    expect(JSON.parse(decrypt(suite.environment_variables))).toEqual({
      secret: "shh",
    });

    const runs = await db("runs").where({ suite_id: suite.id });
    expect(runs).toMatchObject([{ test_id: "testId" }]);

    await db("runs").del();
    await db("suites").del();
  });
});
