/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextApiRequest } from "next";

import { handleNetlifySuitesRequest } from "../../../../server/api/netlify/suites";
import { encrypt } from "../../../../server/models/encrypt";
import { prepareTestDb } from "../../db";
import {
  buildTeam,
  buildTest,
  buildTestTrigger,
  buildTrigger,
  buildUser,
  logger,
} from "../../utils";

const send = jest.fn();
const status = jest.fn().mockReturnValue({ send });
const res = { status };

const db = prepareTestDb();

describe("handleNetlifySuitesRequest", () => {
  beforeAll(async () => {
    await db("users").insert(buildUser({}));
    await db("teams").insert(buildTeam({ apiKey: "qawolf_api_key" }));

    await db("triggers").insert([
      buildTrigger({
        deployment_environment: null,
        deployment_provider: "netlify",
        netlify_event: "onSuccess",
      }),
      buildTrigger({
        deployment_environment: "deploy-preview",
        deployment_provider: "netlify",
        i: 2,
        netlify_event: "onSuccess",
      }),
    ]);
    await db("tests").insert(buildTest({}));

    return db("test_triggers").insert(buildTestTrigger());
  });

  afterEach(async () => {
    jest.clearAllMocks();

    await db("runs").del();
    return db("suites").del();
  });

  afterAll(async () => {
    jest.restoreAllMocks();

    await db.del();
  });

  it("returns 401 if api key not provided", async () => {
    await handleNetlifySuitesRequest(
      { body: {}, headers: {} } as NextApiRequest,
      res as any,
      { db, logger }
    );

    expect(status).toBeCalledWith(401);
    expect(send).toBeCalledWith("No API key provided");
  });

  it("returns 403 if invalid api key provided", async () => {
    await handleNetlifySuitesRequest(
      {
        body: {},
        headers: { authorization: "fake_api_key" },
      } as NextApiRequest,
      res as any,
      { db, logger }
    );

    expect(status).toBeCalledWith(403);
    expect(send).toBeCalledWith("Invalid API Key");
  });

  it("does not create suites if unsupported deploy context", async () => {
    await handleNetlifySuitesRequest(
      {
        body: {
          deployment_environment: "staging",
          deployment_url: "url",
          netlify_event: "onSuccess",
        },
        headers: { authorization: "qawolf_api_key" },
      } as NextApiRequest,
      res as any,
      { db, logger }
    );

    expect(status).toBeCalledWith(200);
    expect(send).toBeCalledWith({ suite_ids: [] });

    const suites = await db("suites");
    expect(suites).toEqual([]);
  });

  it("creates suites and returns suite ids", async () => {
    await handleNetlifySuitesRequest(
      {
        body: {
          deployment_environment: "deploy-preview",
          deployment_url: "url",
          netlify_event: "onSuccess",
        },
        headers: { authorization: "qawolf_api_key" },
      } as NextApiRequest,
      res as any,
      { db, logger }
    );

    expect(status).toBeCalledWith(200);
    expect(send).toBeCalledWith({ suite_ids: [expect.any(String)] });

    const suites = await db("suites");
    expect(suites).toMatchObject([
      {
        environment_variables: encrypt(JSON.stringify({ URL: "url" })),
        trigger_id: "triggerId",
      },
    ]);
  });
});
