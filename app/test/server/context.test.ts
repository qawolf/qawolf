import { NextApiRequest } from "next";

import { context } from "../../server/context";
import { Logger } from "../../server/Logger";
import * as accessService from "../../server/services/access";
import { prepareTestDb } from "./db";
import { buildTeam, buildTeamUser, buildUser } from "./utils";

const db = prepareTestDb();

beforeAll(async () => {
  await db("users").insert([
    buildUser({}),
    buildUser({ i: 2, is_enabled: false }),
  ]);
  await db("teams").insert(buildTeam({}));
  return db("team_users").insert(buildTeamUser({}));
});

afterEach(jest.restoreAllMocks);

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const req = { db } as any;

describe("context", () => {
  it("returns null if no user access token", async () => {
    jest.spyOn(accessService, "verifyAccessToken").mockReturnValue(null);

    const result = await context({
      req: { ...req, headers: { authorization: "" } },
    });

    expect(result).toEqual({
      api_key: null,
      db,
      ip: null,
      logger: expect.any(Logger),
      teams: null,
      user: null,
    });

    expect(accessService.verifyAccessToken).toBeCalledWith("");
  });

  it("returns user by user id if possible", async () => {
    jest.spyOn(accessService, "verifyAccessToken").mockReturnValue("userId");

    const result = await context({
      req: {
        ...req,
        headers: {
          authorization: "auth",
          "x-forwarded-for": "63.18.64.140:11639",
        } as NextApiRequest["headers"],
      },
    });

    expect(result).toMatchObject({
      api_key: null,
      db,
      ip: "63.18.64.140",
      logger: expect.any(Logger),
      teams: [{ id: "teamId", plan: "free" }],
      user: { id: "userId" },
    });
  });

  it("returns api key if possible", async () => {
    jest.spyOn(accessService, "verifyAccessToken");

    const result = await context({
      req: {
        ...req,
        headers: {
          authorization: "qawolf_api_key",
        } as NextApiRequest["headers"],
      },
    });

    expect(result).toEqual({
      api_key: "qawolf_api_key",
      db,
      ip: null,
      logger: expect.any(Logger),
      teams: null,
      user: null,
    });

    expect(accessService.verifyAccessToken).not.toBeCalled();
  });

  it("throws an error if the user is disabled", async () => {
    jest.spyOn(accessService, "verifyAccessToken").mockReturnValue("user2Id");

    await expect(
      context({
        req: {
          ...req,
          headers: {
            authorization: "auth",
            "x-forwarded-for": "63.18.64.140:11639",
          } as NextApiRequest["headers"],
        },
      })
    ).rejects.toThrowError(
      "This account is disabled, email us at hello@qawolf.com"
    );
  });
});
