/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextApiRequest } from "next";

import { handleSuitesRequest } from "../../../server/api/suites";
import { db, dropTestDb, migrateDb } from "../../../server/db";
import { buildDigest } from "../../../server/utils";
import {
  buildApiKey,
  buildEnvironment,
  buildEnvironmentVariable,
  buildGroup,
  buildGroupTest,
  buildTeam,
  buildTest,
  buildUser,
} from "../utils";

const send = jest.fn();
const status = jest.fn().mockReturnValue({ send });
const res = { status };

beforeAll(() => migrateDb());

afterAll(() => dropTestDb());

describe("handleSuitesRequest", () => {
  beforeAll(async () => {
    const token_digest = await buildDigest("secret");

    await db("users").insert(buildUser({}));
    await db("teams").insert(buildTeam({}));
    await db("api_keys").insert(buildApiKey({ token_digest }));

    await db("environments").insert(buildEnvironment({}));
    await db("environment_variables").insert(buildEnvironmentVariable({}));

    await db("groups").insert([
      buildGroup({ is_default: true }),
      buildGroup({ i: 2 }),
    ]);
    await db("tests").insert(buildTest({}));

    return db("group_tests").insert(buildGroupTest());
  });

  afterEach(() => jest.clearAllMocks());

  afterAll(async () => {
    jest.restoreAllMocks();

    await db("api_keys").del();
    await db("environment_variables").del();
    await db("environments").del();
    await db("users").del();

    await db("group_tests").del();
    await db("tests").del();
    await db("groups").del();

    await db("runs").del();
    await db("suites").del();

    return db("teams").del();
  });

  it("returns 401 if auth token not provided", async () => {
    await handleSuitesRequest(
      { body: {}, headers: {} } as NextApiRequest,
      res as any
    );

    expect(status).toBeCalledWith(401);
    expect(send).toBeCalledWith("No API key provided");
  });

  it("returns 400 if group id not provided", async () => {
    await handleSuitesRequest(
      {
        body: {},
        headers: { authorization: "token" },
      } as NextApiRequest,
      res as any
    );

    expect(status).toBeCalledWith(400);
    expect(send).toBeCalledWith("No group id provided");
  });

  it("returns 404 if group id invalid", async () => {
    await handleSuitesRequest(
      {
        body: { group_id: "fakeId" },
        headers: { authorization: "token" },
      } as NextApiRequest,
      res as any
    );

    expect(status).toBeCalledWith(404);
    expect(send).toBeCalledWith("Invalid group id");
  });

  it("returns 403 if invalid auth token", async () => {
    await handleSuitesRequest(
      {
        body: { group_id: "groupId" },
        headers: { authorization: "invalid" },
      } as NextApiRequest,
      res as any
    );

    expect(status).toBeCalledWith(403);
    expect(send).toBeCalledWith("API key cannot create suite");
  });

  it("returns 500 if no tests in group", async () => {
    await handleSuitesRequest(
      {
        body: { group_id: "group2Id" },
        headers: { authorization: "secret" },
      } as NextApiRequest,
      res as any
    );

    expect(status).toBeCalledWith(500);
    expect(send).toBeCalledWith("No tests in group");
  });

  it("creates a suite and returns url", async () => {
    await handleSuitesRequest(
      {
        body: { env: { secret: "shh" }, group_id: "groupId" },
        headers: { authorization: "secret" },
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
