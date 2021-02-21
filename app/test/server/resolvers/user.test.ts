import { Logger } from "../../../server/Logger";
import * as userModel from "../../../server/models/user";
import {
  currentUserResolver,
  sendLoginCodeResolver,
  signInWithEmailResolver,
  signInWithGitHubResolver,
  teamUsersResolver,
  updateUserResolver,
} from "../../../server/resolvers/user";
import * as accessService from "../../../server/services/access";
import * as emailService from "../../../server/services/alert/email";
import * as gitHubUserService from "../../../server/services/gitHub/user";
import { User } from "../../../server/types";
import { minutesFromNow } from "../../../shared/utils";
import { prepareTestDb } from "../db";
import {
  buildInvite,
  buildTeamUser,
  deleteUser,
  logger,
  testContext,
} from "../utils";

const invite = buildInvite({});

const gitHubUser = {
  avatar_url: "avatar.png",
  email: "user1@qawolf.com",
  github_id: 1,
  github_login: "1",
  name: "GitHub User",
};

const gitHubUser2 = {
  avatar_url: "avatar2.png",
  email: "user2@qawolf.com",
  github_id: 234,
  github_login: "github_user2",
  name: "GitHub User 2",
};

const gitHubUser3 = {
  avatar_url: "avatar3.png",
  email: "user3@qawolf.com",
  github_id: 456,
  github_login: "github_user3",
  name: "GitHub User 3",
};

const db = prepareTestDb();
const context = { ...testContext, db };
const options = { db, logger };
const teams = testContext.teams;

beforeAll(async () => {
  await db("users").insert(testContext.user);
  await db("teams").insert(teams);
  await db("team_users").insert(buildTeamUser({}));
});

afterAll(() => jest.restoreAllMocks());

describe("currentUserResolver", () => {
  afterEach(jest.restoreAllMocks);

  it("returns user if user exists", async () => {
    const user = await currentUserResolver({}, {}, context);

    expect(user).toEqual({ ...context.user, teams });
  });

  it("returns null otherwise", async () => {
    const user = await currentUserResolver(
      {},
      {},
      { api_key: null, db, ip: null, logger, teams: null, user: null }
    );

    expect(user).toBeNull();
  });
});

describe("sendLoginCodeResolver", () => {
  beforeAll(() => {
    return db("invites").insert(invite);
  });

  beforeEach(() => {
    jest.spyOn(emailService, "sendEmailForLoginCode").mockResolvedValue();
  });

  afterEach(() => jest.restoreAllMocks());

  afterAll(() => {
    jest.restoreAllMocks();
    return db("invites").del();
  });

  it("updates login code if user already exists", async () => {
    const email = context.user.email;
    const user = await db.select("*").from("users").where({ email }).first();

    const result = await sendLoginCodeResolver(
      {},
      { email: email.toUpperCase() },
      { ...context, user: null }
    );

    const updatedUser = await db
      .select("*")
      .from("users")
      .where({ email })
      .first();

    expect(updatedUser.login_code_digest).toBeTruthy();
    expect(updatedUser.login_code_digest).not.toBe(user.login_code_digest);

    expect(result).toEqual({ email });

    expect(emailService.sendEmailForLoginCode).toBeCalledWith({
      logger: expect.any(Logger),
      login_code: expect.any(String),
      user: {
        ...updatedUser,
        login_code_expires_at: expect.any(String),
        updated_at: expect.any(String),
      },
    });
  });

  it("creates a new user without an invite", async () => {
    const email = "popcorn@qawolf.com";

    const result = await sendLoginCodeResolver(
      {},
      { email },
      { ...context, user: null }
    );

    const newUser = await db.select("*").from("users").where({ email }).first();

    expect(newUser).toMatchObject({
      email,
      login_code_digest: expect.any(String),
      login_code_expires_at: expect.any(Date),
    });

    expect(result).toEqual({ email });

    expect(emailService.sendEmailForLoginCode).toBeCalledWith({
      logger: expect.any(Logger),
      login_code: expect.any(String),
      user: {
        ...newUser,
        created_at: undefined,
        login_code_expires_at: expect.any(String),
        updated_at: undefined,
      },
    });

    const environments = await db
      .select("*")
      .from("environments")
      .orderBy("name", "asc");
    expect(environments).toMatchObject([
      {
        name: "Production",
      },
      { name: "Staging" },
    ]);

    await db.transaction(async (trx) => deleteUser(newUser.id, trx));
  });

  it("creates a new user with an invite", async () => {
    const email = "ruby@qawolf.com";

    const result = await sendLoginCodeResolver(
      {},
      { email, invite_id: invite.id },
      { ...context, user: null }
    );

    const newUser = await db.select("*").from("users").where({ email }).first();

    expect(newUser).toMatchObject({
      email,
      login_code_digest: expect.any(String),
      login_code_expires_at: expect.any(Date),
      wolf_name: invite.wolf_name,
      wolf_number: invite.wolf_number,
      wolf_variant: invite.wolf_variant,
    });

    expect(result).toEqual({ email });

    expect(emailService.sendEmailForLoginCode).toBeCalledWith({
      logger: expect.any(Logger),
      login_code: expect.any(String),
      user: {
        ...newUser,
        created_at: undefined,
        login_code_expires_at: expect.any(String),
        updated_at: undefined,
      },
    });

    await db.transaction(async (trx) => deleteUser(newUser.id, trx));
  });
});

describe("signInWithEmailResolver", () => {
  const login_code = "ABCDEF";
  let user: User;
  let sendEmailForLoginCodeSpy: jest.SpyInstance;

  beforeAll(async () => {
    user = await userModel.createUserWithEmail(
      { email: "spice@qawolf.com", login_code },
      options
    );

    await db("team_users").insert(buildTeamUser({ i: 2, user_id: user.id }));

    sendEmailForLoginCodeSpy = jest
      .spyOn(emailService, "sendEmailForLoginCode")
      .mockResolvedValue();
  });

  beforeEach(() => sendEmailForLoginCodeSpy.mockReset());

  afterAll(async () => {
    jest.restoreAllMocks();
    await db("team_users").where({ user_id: user.id }).del();
    await db("users").where({ id: user.id }).del();
  });

  it("signs in if correct credentials", async () => {
    const result = await signInWithEmailResolver(
      {},
      { email: "Spice@qawolf.com", login_code },
      { ...context, user: null }
    );

    expect(user).toMatchObject({ email: "spice@qawolf.com" });

    expect(result).toMatchObject({
      access_token: expect.any(String),
      user: { email: user.email, id: user.id },
    });

    expect(sendEmailForLoginCodeSpy).not.toBeCalled();

    await userModel.updateUser({ id: user.id, login_code }, options);
  });

  it("throws an error if incorrect credentials", async () => {
    await expect(
      signInWithEmailResolver(
        {},
        { email: "spice@qawolf.com", login_code: "ABC123" },
        context
      )
    ).rejects.toThrowError("wasn't valid");
    expect(sendEmailForLoginCodeSpy).not.toBeCalled();
  });

  it("throws an error and resets code if code expired", async () => {
    await userModel.updateUser({ id: user.id, login_code }, options);

    await db("users")
      .where({ id: user.id })
      .update({
        login_code_expires_at: new Date("2000"),
      });

    await expect(
      signInWithEmailResolver(
        {},
        { email: "spice@qawolf.com", login_code },
        context
      )
    ).rejects.toThrowError("expired");

    const updatedUser = await db
      .select("*")
      .from("users")
      .where({ id: user.id })
      .first();

    expect(updatedUser.login_code_digest).not.toBe(user.login_code_digest);
    expect(updatedUser.login_code_expires_at).not.toBe(
      user.login_code_expires_at
    );

    expect(sendEmailForLoginCodeSpy).toBeCalledWith({
      logger: expect.any(Logger),
      login_code: expect.any(String),
      user: {
        ...updatedUser,
        login_code_expires_at: expect.any(String),
        updated_at: expect.any(String),
      },
    });

    await userModel.updateUser({ id: user.id, login_code }, options);
  });
});

describe("signInWithGitHubResolver", () => {
  beforeAll(() => {
    return db("invites").insert(invite);
  });

  afterAll(() => {
    jest.restoreAllMocks();
    return db("invites").del();
  });

  it("updates existing user if possible", async () => {
    jest
      .spyOn(gitHubUserService, "findGitHubFields")
      .mockResolvedValue({ ...gitHubUser, email: "new@email.com" });
    jest.spyOn(userModel, "createUserWithGitHub");
    jest.spyOn(accessService, "signAccessToken").mockReturnValue("signedToken");

    const { access_token, user } = await signInWithGitHubResolver(
      {},
      { github_code: "code", github_state: "state" },
      { ...context, user: null }
    );

    expect(access_token).toBe("signedToken");
    expect(user).toMatchObject(gitHubUser);

    expect(userModel.createUserWithGitHub).not.toBeCalled();
  });

  it("creates a new user from invite", async () => {
    jest
      .spyOn(gitHubUserService, "findGitHubFields")
      .mockResolvedValue(gitHubUser2);
    jest.spyOn(userModel, "updateGitHubFields");
    jest.spyOn(accessService, "signAccessToken").mockReturnValue("signedToken");

    const { access_token, user } = await signInWithGitHubResolver(
      {},
      { github_code: "code", github_state: "state", invite_id: invite.id },
      { ...context, user: null }
    );

    expect(access_token).toBeTruthy();

    expect(user).toMatchObject({
      wolf_name: invite.wolf_name,
      wolf_number: invite.wolf_number,
      wolf_variant: invite.wolf_variant,
    });

    const teamUsers = await db
      .select("*")
      .from("team_users")
      .where({ user_id: user.id });
    expect(teamUsers).toEqual([]);

    await db("users").where({ id: user.id }).del();
  });

  it("creates a new user without invite", async () => {
    jest
      .spyOn(gitHubUserService, "findGitHubFields")
      .mockResolvedValue(gitHubUser2);
    jest.spyOn(userModel, "updateGitHubFields");
    jest.spyOn(accessService, "signAccessToken").mockReturnValue("signedToken");

    const { access_token, user } = await signInWithGitHubResolver(
      {},
      { github_code: "code", github_state: "state" },
      { ...context, user: null }
    );

    expect(access_token).toBe("signedToken");
    expect(user).toMatchObject({
      ...gitHubUser2,
      teams: [{ plan: "free" }],
    });

    const users = await db.select("*").from("users");
    expect(users).toHaveLength(2);

    const teams = await db
      .select("*")
      .from("teams")
      .orderBy("created_at", "asc");
    expect(teams).toHaveLength(2);

    const teamUsers = await db.select("*").from("team_users");
    expect(teamUsers).toMatchObject([
      { team_id: "teamId" },
      { team_id: user.teams[0].id, role: "admin" },
    ]);

    expect(userModel.updateGitHubFields).not.toBeCalled();
  });

  it("allows sign in if email already taken", async () => {
    const user = await userModel.createUserWithEmail(
      { email: "spice@qawolf.com", login_code: "ABCDEF" },
      options
    );

    jest
      .spyOn(gitHubUserService, "findGitHubFields")
      .mockResolvedValue({ ...gitHubUser3, email: user.email });
    jest.spyOn(userModel, "updateGitHubFields");
    jest.spyOn(accessService, "signAccessToken").mockReturnValue("signedToken");

    const { access_token, user: updatedUser } = await signInWithGitHubResolver(
      {},
      { github_code: "code", github_state: "state" },
      { ...context, user: null }
    );

    expect(access_token).toBe("signedToken");
    expect(updatedUser).toMatchObject({
      avatar_url: "avatar3.png",
      email: "spice@qawolf.com",
      github_id: 456,
      github_login: "github_user3",
      name: "GitHub User 3",
    });

    await db("users").where({ email: "spice@qawolf.com" }).del();
  });
});

describe("teamUsersResolver", () => {
  it("returns users in a team", async () => {
    const users = await teamUsersResolver(context.teams[0], {}, context);

    expect(users).toHaveLength(1);
    expect(users).toMatchObject([{ id: context.user.id }]);
  });
});

describe("updateUserResolver", () => {
  it("updates user", async () => {
    const onboarded_at = minutesFromNow();
    const user = await updateUserResolver({}, { onboarded_at }, context);

    expect(user).toMatchObject({ id: "userId", onboarded_at });
  });
});
