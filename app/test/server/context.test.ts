import { NextApiRequest } from "next";

import { context } from "../../server/context";
import { db, dropTestDb, migrateDb } from "../../server/db";
import { Logger } from "../../server/Logger";
import * as accessService from "../../server/services/access";
import { buildTeam, buildTeamUser, buildUser } from "./utils";

beforeAll(async () => {
  await migrateDb();
  await db("users").insert([
    buildUser({}),
    buildUser({ i: 2, is_enabled: false }),
  ]);
  await db("teams").insert(buildTeam({}));
  return db("team_users").insert(buildTeamUser({}));
});

afterAll(() => dropTestDb());

afterEach(jest.restoreAllMocks);

describe("context", () => {
  it("returns null if no user access token", async () => {
    jest.spyOn(accessService, "verifyAccessToken").mockReturnValue(null);
    const user = await context({
      req: { headers: { authorization: "" } } as NextApiRequest,
    });

    expect(user).toEqual({
      api_key: null,
      ip: null,
      logger: expect.any(Logger),
      teams: null,
      user: null,
    });

    expect(accessService.verifyAccessToken).toBeCalledWith("");
  });

  it("returns user by user id if possible", async () => {
    jest.spyOn(accessService, "verifyAccessToken").mockReturnValue("userId");

    const user = await context({
      req: {
        headers: {
          authorization: "auth",
          "x-forwarded-for": "63.18.64.140:11639",
        } as NextApiRequest["headers"],
      } as NextApiRequest,
    });

    expect(user).toMatchObject({
      api_key: null,
      ip: "63.18.64.140",
      logger: expect.any(Logger),
      teams: [{ id: "teamId", plan: "free" }],
      user: { id: "userId" },
    });
  });

  it("returns api key if possible", async () => {
    jest.spyOn(accessService, "verifyAccessToken");

    const user = await context({
      req: {
        headers: {
          authorization: "qawolf_api_key",
        } as NextApiRequest["headers"],
      } as NextApiRequest,
    });

    expect(user).toEqual({
      api_key: "qawolf_api_key",
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
          headers: {
            authorization: "auth",
            "x-forwarded-for": "63.18.64.140:11639",
          } as NextApiRequest["headers"],
        } as NextApiRequest,
      })
    ).rejects.toThrowError(
      "This account is disabled, email us at hello@qawolf.com"
    );
  });
});
