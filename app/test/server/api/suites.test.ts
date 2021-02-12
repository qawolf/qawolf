/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextApiRequest } from "next";

import { handleSuitesRequest } from "../../../server/api/suites";
import { db, dropTestDb, migrateDb } from "../../../server/db";
import { encrypt } from "../../../server/models/encrypt";
import {
  buildEnvironment,
  buildEnvironmentVariable,
  buildTeam,
  buildTest,
  buildTestTrigger,
  buildTrigger,
  buildUser,
} from "../utils";

const send = jest.fn();
const status = jest.fn().mockReturnValue({ send });
const res = { status };

beforeAll(() => migrateDb());

afterAll(() => dropTestDb());

describe("handleSuitesRequest", () => {
  beforeAll(async () => {
    await db("users").insert(buildUser({}));
    await db("teams").insert(buildTeam({}));

    await db("teams")
      .where({ id: "teamId" })
      .update({ api_key: encrypt("qawolf_api_key") });

    await db("environments").insert(buildEnvironment({}));
    await db("environment_variables").insert(buildEnvironmentVariable({}));

    await db("triggers").insert([
      buildTrigger({ is_default: true }),
      buildTrigger({ i: 2 }),
    ]);
    await db("tests").insert(buildTest({}));

    return db("test_triggers").insert(buildTestTrigger());
  });

  afterEach(() => jest.clearAllMocks());

  afterAll(async () => {
    jest.restoreAllMocks();

    await db("api_keys").del();
    await db("environment_variables").del();
    await db("environments").del();
    await db("users").del();

    await db("test_triggers").del();
    await db("tests").del();
    await db("triggers").del();

    await db("runs").del();
    await db("suites").del();

    return db("teams").del();
  });

  it("returns 401 if api key not provided", async () => {
    await handleSuitesRequest(
      { body: {}, headers: {} } as NextApiRequest,
      res as any
    );

    expect(status).toBeCalledWith(401);
    expect(send).toBeCalledWith("No API key provided");
  });

  it("returns 400 if trigger id not provided", async () => {
    await handleSuitesRequest(
      {
        body: {},
        headers: { authorization: "token" },
      } as NextApiRequest,
      res as any
    );

    expect(status).toBeCalledWith(400);
    expect(send).toBeCalledWith("No trigger id provided");
  });

  it("returns 404 if triggger id invalid", async () => {
    await handleSuitesRequest(
      {
        body: { trigger_id: "fakeId" },
        headers: { authorization: "token" },
      } as NextApiRequest,
      res as any
    );

    expect(status).toBeCalledWith(404);
    expect(send).toBeCalledWith("Invalid trigger id");
  });

  it("returns 403 if invalid api key", async () => {
    await handleSuitesRequest(
      {
        body: { trigger_id: "triggerId" },
        headers: { authorization: "invalid" },
      } as NextApiRequest,
      res as any
    );

    expect(status).toBeCalledWith(403);
    expect(send).toBeCalledWith("API key cannot create suite");
  });

  it("returns 500 if no tests in trigger", async () => {
    await handleSuitesRequest(
      {
        body: { trigger_id: "trigger2Id" },
        headers: { authorization: "qawolf_api_key" },
      } as NextApiRequest,
      res as any
    );

    expect(status).toBeCalledWith(500);
    expect(send).toBeCalledWith("No tests in trigger");
  });

  it("creates a suite and returns url", async () => {
    await handleSuitesRequest(
      {
        body: { env: { secret: "shh" }, trigger_id: "triggerId" },
        headers: { authorization: "qawolf_api_key" },
      } as NextApiRequest,
      res as any
    );

    expect(status).toBeCalledWith(200);
    expect(send).toBeCalledWith({ url: expect.any(String) });

    const suite = await db.select("*").from("suites").first();
    expect(send.mock.calls[0][0].url).toMatch(`/tests/${suite.id}`);
    expect(suite.environment_variables).toBeTruthy();

    await db("runs").del();
    await db("suites").del();
  });
});
