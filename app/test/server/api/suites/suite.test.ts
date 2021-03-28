/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextApiRequest } from "next";

import {
  getStatusForSuite,
  handleSuiteRequest,
} from "../../../../server/api/suites/suite";
import { createRunsForTests } from "../../../../server/models/run";
import { SuiteRun } from "../../../../server/types";
import { prepareTestDb } from "../../db";
import {
  buildSuite,
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

describe("getStatusForSuite", () => {
  it("returns created if some runs in progress", () => {
    expect(
      getStatusForSuite([
        { status: "fail" },
        { status: "created" },
      ] as SuiteRun[])
    ).toBe("created");
  });

  it("returns fail if some runs failed", () => {
    expect(
      getStatusForSuite([{ status: "fail" }, { status: "pass" }] as SuiteRun[])
    ).toBe("fail");
  });

  it("returns pass if all runs passed", () => {
    expect(
      getStatusForSuite([{ status: "pass" }, { status: "pass" }] as SuiteRun[])
    ).toBe("pass");
  });
});

describe("handleSuiteRequest", () => {
  beforeAll(async () => {
    await db("users").insert(buildUser({}));
    await db("teams").insert(buildTeam({ apiKey: "qawolf_api_key" }));

    await db("triggers").insert([buildTrigger({}), buildTrigger({ i: 2 })]);
    await db("tests").insert(buildTest({}));

    await db("test_triggers").insert(buildTestTrigger());

    await db("suites").insert(buildSuite({}));
    await createRunsForTests(
      { suite_id: "suiteId", tests: [buildTest({})] },
      { db, logger }
    );
  });

  afterEach(() => jest.clearAllMocks());

  afterAll(async () => {
    jest.restoreAllMocks();

    await db.del();
  });

  it("returns 401 if api key not provided", async () => {
    await handleSuiteRequest(
      { headers: {}, query: {} as NextApiRequest["query"] } as NextApiRequest,
      res as any,
      { db, logger }
    );

    expect(status).toBeCalledWith(401);
    expect(send).toBeCalledWith("No API key provided");
  });

  it("returns 400 if suite id not provided", async () => {
    await handleSuiteRequest(
      {
        headers: { authorization: "token" },
        query: {} as NextApiRequest["query"],
      } as NextApiRequest,
      res as any,
      { db, logger }
    );

    expect(status).toBeCalledWith(400);
    expect(send).toBeCalledWith("No suite id provided");
  });

  it("returns 404 if suite id invalid", async () => {
    await handleSuiteRequest(
      {
        headers: { authorization: "token" },
        query: { suite_id: "fakeId" } as NextApiRequest["query"],
      } as NextApiRequest,
      res as any,
      { db, logger }
    );

    expect(status).toBeCalledWith(404);
    expect(send).toBeCalledWith("Invalid suite id");
  });

  it("returns 403 if invalid api key", async () => {
    await handleSuiteRequest(
      {
        headers: { authorization: "invalid" },
        query: { suite_id: "suiteId" } as NextApiRequest["query"],
      } as NextApiRequest,
      res as any,
      { db, logger }
    );

    expect(status).toBeCalledWith(403);
    expect(send).toBeCalledWith("API key cannot get suite");
  });

  it("returns a suite", async () => {
    await handleSuiteRequest(
      {
        headers: { authorization: "qawolf_api_key" },
        query: { suite_id: "suiteId" } as NextApiRequest["query"],
      } as NextApiRequest,
      res as any,
      { db, logger }
    );

    expect(status).toBeCalledWith(200);
    expect(send.mock.calls[0][0]).toEqual({
      id: "suiteId",
      is_complete: false,
      runs: [{ id: expect.any(String), status: "created", test_name: "test" }],
      status: "created",
    });
  });
});
