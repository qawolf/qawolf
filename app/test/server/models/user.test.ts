import * as userModel from "../../../server/models/user";
import { WOLF_NAMES, WOLF_VARIANTS } from "../../../server/models/wolfOptions";
import { GitHubFields, User } from "../../../server/types";
import { isCorrectCode } from "../../../server/utils";
import { minutesFromNow } from "../../../shared/utils";
import { prepareTestDb } from "../db";
import { buildTeam, buildTeamUser, buildUser, logger } from "../utils";

const {
  authenticateUser,
  createUserWithEmail,
  createUserWithGitHub,
  findUser,
  findUsersForTeam,
  updateGitHubFields,
  updateUser,
} = userModel;

const gitHubUser = {
  avatar_url: "avatar.png",
  github_id: 123,
  email: "spirit@qawolf.com",
  name: "Spirit",
};

const db = prepareTestDb();
const options = { db, logger };

describe("user model", () => {
  beforeAll(async () => {
    await db("teams").insert(buildTeam({}));

    return db("users").insert([
      {
        ...gitHubUser,
        github_login: "spirit_github",
        id: "spirit",
        wolf_name: "Autumn",
        wolf_number: 123,
        wolf_variant: "gold",
      },
    ]);
  });

  afterAll(() => jest.restoreAllMocks());

  describe("authenticateUser", () => {
    const login_code = "ABCDEF";

    beforeAll(() => {
      return createUserWithEmail(
        {
          email: "acorn@qawolf.com",
          login_code: "ABCDEF",
        },
        options
      );
    });

    afterAll(() => {
      return db("users").where({ email: "acorn@qawolf.com" }).del();
    });

    it("returns user if correct credentials (case insensitive)", async () => {
      const user = await authenticateUser(
        { email: "acorn@qawolf.com", login_code },
        options
      );

      expect(user).toMatchObject({ email: "acorn@qawolf.com" });
      // reset login code after authenticating
      await updateUser({ id: user.id, login_code }, options);

      const user2 = await authenticateUser(
        { email: "acorn@qawolf.com", login_code: login_code.toLowerCase() },
        options
      );

      expect(user2).toMatchObject({ email: "acorn@qawolf.com" });

      const user3 = (await findUser({ id: user.id }, options)) as User;
      expect(user3).toMatchObject({
        login_code_digest: null,
        login_code_expires_at: null,
      });
      // reset login code after authenticating
      await updateUser({ id: user.id, login_code }, options);
    });

    it("throws an error if user not found", async () => {
      await expect(
        authenticateUser(
          { email: "fake@email.com", login_code: "ABCDEF" },
          options
        )
      ).rejects.toThrowError("not found");
    });

    it("throws an error if incorrect credentials", async () => {
      await expect(
        authenticateUser(
          { email: "acorn@qawolf.com", login_code: "ABC123" },
          options
        )
      ).rejects.toThrowError("wasn't valid");
    });

    it("throws an error if login code expired", async () => {
      await db("users")
        .where({ email: "acorn@qawolf.com" })
        .update({ login_code_expires_at: new Date("2000") });

      await expect(
        authenticateUser({ email: "acorn@qawolf.com", login_code }, options)
      ).rejects.toThrowError("expired");

      await db("users")
        .where({ email: "acorn@qawolf.com" })
        .update({ login_code_expires_at: new Date() });
    });
  });

  describe("createUserWithEmail", () => {
    const email = "SOCKS@qawolf.com";

    afterEach(() => {
      return db("users").where({ email }).del();
    });

    it("creates a new user from email", async () => {
      await createUserWithEmail({ email, login_code: "ABCDEF" }, options);

      const user = await db("users")
        .select("*")
        .where({ email: email.toLowerCase() })
        .first();

      expect(user).toMatchObject({
        avatar_url: null,
        email: "socks@qawolf.com",
        github_id: null,
        github_login: null,
        id: expect.any(String),
        is_enabled: true,
        login_code_digest: expect.any(String),
        login_code_expires_at: expect.any(Date),
        name: null,
        onboarded_at: null,
        wolf_number: expect.any(Number),
      });

      expect(WOLF_VARIANTS).toContain(user.wolf_variant);
    });
  });

  describe("createUserWithGitHub", () => {
    beforeAll(() => {
      jest.spyOn(userModel, "randomWolfNumber").mockReturnValue(11);
    });

    afterEach(() => {
      return db("users").where({ github_id: 345 }).del();
    });

    afterAll(jest.clearAllMocks);

    const createUserTest = async (
      wolf_variant: string | null,
      wolf_name?: string,
      wolf_number?: number
    ): Promise<User> => {
      await createUserWithGitHub(
        {
          avatar_url: "url",
          email: "Buck@QAWOLF.com",
          github_id: 345,
          github_login: "spirit",
          name: "name",
          wolf_name,
          wolf_number,
          wolf_variant,
        },
        options
      );

      return db.select("*").from("users").where({ github_id: 345 }).first();
    };

    it("creates a new user with specified wolf", async () => {
      const user = await createUserTest("husky", "Lena", 123);

      expect(user).toMatchObject({
        avatar_url: "url",
        email: "buck@qawolf.com",
        github_id: 345,
        github_login: "spirit",
        is_enabled: true,
        name: "name",
        onboarded_at: null,
        wolf_name: "Lena",
        wolf_number: 123,
        wolf_variant: "husky",
      });
    });

    it("creates a new user with random wolf variant", async () => {
      const user = await createUserTest(null);

      expect(WOLF_NAMES).toContain(user.wolf_name);
      expect(WOLF_VARIANTS).toContain(user.wolf_variant);
    });

    it("creates a new user with invalid wolf variant", async () => {
      const user = await createUserTest("fakeWolfVariant");

      expect(WOLF_NAMES).toContain(user.wolf_name);
      expect(WOLF_VARIANTS).toContain(user.wolf_variant);
    });
  });

  describe("findUser", () => {
    it("returns user by id", async () => {
      const user = await findUser({ id: "spirit" }, options);

      expect(user).toMatchObject({
        id: "spirit",
        name: "Spirit",
      });
    });

    it("returns user by id with no transaction", async () => {
      const user = await findUser({ id: "spirit" }, options);

      expect(user).toMatchObject({
        id: "spirit",
        name: "Spirit",
      });
    });

    it("returns user by email (case insensitive)", async () => {
      const user = await findUser({ email: "spirit@qawolf.com" }, options);

      expect(user).toMatchObject({
        id: "spirit",
        name: "Spirit",
      });

      const user2 = await findUser({ email: "SpIriT@QAWOLF.com" }, options);

      expect(user2).toMatchObject({
        id: "spirit",
        name: "Spirit",
      });
    });

    it("returns user by GitHub id", async () => {
      const user = await findUser({ github_id: 123 }, options);

      expect(user).toMatchObject({
        id: "spirit",
        name: "Spirit",
      });
    });

    it("returns user with multiple criteria", async () => {
      const user = await findUser(
        { email: "fake@email.com", github_id: 123 },
        options
      );

      expect(user).toMatchObject({
        id: "spirit",
        name: "Spirit",
      });
    });

    it("returns null if user not found", async () => {
      const user = await findUser({ id: "fakeId" }, options);

      expect(user).toBeNull();
    });

    it("throws an error if email, id, and github_id not provided", async () => {
      await expect(findUser({}, options)).rejects.toThrowError(
        "id, email, or GitHub id"
      );
    });
  });

  describe("findUsersForTeam", () => {
    beforeAll(async () => {
      await db("users").insert(buildUser({ i: 2 }));
      return db("team_users").insert([
        buildTeamUser({ team_id: "teamId", user_id: "spirit" }),
        buildTeamUser({ team_id: "teamId", i: 2, user_id: "user2Id" }),
      ]);
    });

    afterAll(async () => {
      await db("users").where({ id: "user2Id" }).del();
      return db("team_users").del();
    });

    it("finds all users for a given team", async () => {
      const users = await findUsersForTeam("teamId", options);

      expect(users).toMatchObject([{ id: "spirit" }, { id: "user2Id" }]);
    });

    it("returns an empty array if no users found", async () => {
      const users = await findUsersForTeam("fakeId", options);

      expect(users).toEqual([]);
    });
  });

  describe("updateGitHubFields", () => {
    it("updates user with same GitHub id", async () => {
      const updatedUser = await updateGitHubFields(
        "spirit",
        {
          avatar_url: "avatar2.png",
          github_id: 123,
          github_login: "spirit_github_new",
        } as GitHubFields,
        options
      );

      expect(updatedUser).toMatchObject({
        avatar_url: "avatar2.png",
        github_id: 123,
        github_login: "spirit_github_new",
      });
    });
  });

  describe("updateUser", () => {
    const onboarded_at = minutesFromNow();

    it("updates login code on user", async () => {
      await updateUser({ id: "spirit", login_code: "ABCDEF" }, { db, logger });

      const user = await findUser({ id: "spirit" }, { db, logger });

      expect(user).toMatchObject({
        login_code_digest: expect.any(String),
        login_code_expires_at: expect.any(Date),
      });
      // check that the digest matches the login code
      const isCorrect = await isCorrectCode({
        code: "ABCDEF",
        digest: user?.login_code_digest || "",
      });
      expect(isCorrect).toBe(true);
    });

    it("updates onboarded at on user", async () => {
      await updateUser({ id: "spirit", onboarded_at }, { db, logger });

      const user = await findUser({ id: "spirit" }, { db, logger });

      expect(user).toMatchObject({
        id: "spirit",
        onboarded_at: new Date(onboarded_at),
      });
    });

    it("updates wolf name on user", async () => {
      await updateUser({ id: "spirit", wolf_name: "new name" }, { db, logger });

      const user = await findUser({ id: "spirit" }, { db, logger });

      expect(user).toMatchObject({
        id: "spirit",
        wolf_name: "new name",
      });
    });

    it("throws an error if wolf name too long", async () => {
      await expect(
        updateUser(
          { id: "spirit", wolf_name: "this wolf name is too long" },
          options
        )
      ).rejects.toThrowError("exceeds max length");
    });

    it("throws an error if user not found", async () => {
      await expect(
        updateUser({ id: "fakeId", onboarded_at }, { db, logger })
      ).rejects.toThrowError("not found");
    });

    it("throws an error if no updates provided", async () => {
      await expect(updateUser({ id: "spirit" }, options)).rejects.toThrowError(
        "No updates"
      );
    });
  });
});
