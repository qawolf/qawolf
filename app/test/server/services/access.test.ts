jest.mock("jsonwebtoken");
import jwt from "jsonwebtoken";

import { db, dropTestDb, migrateDb } from "../../../server/db";
import {
  signAccessToken,
  verifyAccessToken,
} from "../../../server/services/access";

const gitHubUser = {
  avatar_url: "avatar.png",
  github_id: 123,
  email: "spirit@qawolf.com",
  name: "Spirit",
};

beforeAll(async () => {
  await migrateDb();

  return db.transaction(async (trx) => {
    return trx("users").insert({
      ...gitHubUser,
      github_login: "spirit_github",
      id: "spirit",
      wolf_name: "Alpine",
      wolf_number: 123,
      wolf_variant: "black",
    });
  });
});

afterAll(() => {
  jest.restoreAllMocks();
  return dropTestDb();
});

describe("signAccessToken", () => {
  it("signs an access token", () => {
    /* eslint-disable-next-line  @typescript-eslint/no-explicit-any */
    (jwt.sign as any).mockReturnValue("signedToken");

    const token = signAccessToken("userId");
    expect(token).toBe("signedToken");
  });
});

describe("verifyAccessToken", () => {
  it("verifies an access token", () => {
    /* eslint-disable-next-line  @typescript-eslint/no-explicit-any */
    (jwt.verify as any).mockReturnValue({ user_id: "userId" });

    const userId = verifyAccessToken("token");
    expect(userId).toBe("userId");
  });

  it("returns null if no user id", () => {
    /* eslint-disable-next-line  @typescript-eslint/no-explicit-any */
    (jwt.verify as any).mockReturnValue({});

    const userId = verifyAccessToken("token");
    expect(userId).toBeNull();
  });
});
