import { db, dropTestDb, migrateDb } from "../../../server/db";
import * as groupModel from "../../../server/models/trigger";
import * as suiteModel from "../../../server/models/suite";
import * as testModel from "../../../server/models/test";
import {
  ensureEnvironmentAccess,
  ensureEnvironmentVariableAccess,
  ensureGroupAccess,
  ensureSuiteAccess,
  ensureTeamAccess,
  ensureTeams,
  ensureTestAccess,
  ensureUser,
} from "../../../server/resolvers/utils";
import { Group, Team, Test, User } from "../../../server/types";
import {
  buildEnvironment,
  buildEnvironmentVariable,
  buildSuite,
  buildTeam,
  logger,
} from "../utils";

const teams = [buildTeam({})];
const suite = buildSuite({ team_id: "team2Id" });

beforeAll(() => migrateDb());

afterAll(() => dropTestDb());

describe("ensureEnvironmentAccess", () => {
  beforeAll(async () => {
    await db("teams").insert([buildTeam({}), buildTeam({ i: 2 })]);
    return db("environments").insert([
      buildEnvironment({}),
      buildEnvironment({ i: 2, team_id: "team2Id" }),
    ]);
  });

  afterAll(async () => {
    await db("environments").del();
    return db("teams").del();
  });

  it("throws an error if teams not provided", async () => {
    const testFn = async (): Promise<Team> => {
      return ensureEnvironmentAccess({
        environment_id: "environmentId",
        logger,
        teams: null,
      });
    };

    await expect(testFn()).rejects.toThrowError("no teams");
  });

  it("throws an error if teams do not have access", async () => {
    const testFn = async (): Promise<Team> => {
      return ensureEnvironmentAccess({
        environment_id: "environment2Id",
        logger,
        teams,
      });
    };

    await expect(testFn()).rejects.toThrowError("cannot access environment");
  });

  it("returns selected team if teams have access", async () => {
    const team = await ensureEnvironmentAccess({
      environment_id: "environmentId",
      logger,
      teams,
    });

    expect(team).toEqual(teams[0]);
  });
});

describe("ensureEnvironmentVariableAccess", () => {
  beforeAll(async () => {
    await db("teams").insert([buildTeam({}), buildTeam({ i: 2 })]);

    await db("environments").insert([
      buildEnvironment({}),
      buildEnvironment({ i: 2, team_id: "team2Id" }),
    ]);

    return db("environment_variables").insert([
      buildEnvironmentVariable({}),
      buildEnvironmentVariable({
        i: 2,
        environment_id: "environment2Id",
        team_id: "team2Id",
      }),
    ]);
  });

  afterAll(async () => {
    await db("environment_variables").del();
    await db("environments").del();
    return db("teams").del();
  });

  it("throws an error if teams not provided", async () => {
    const testFn = async (): Promise<Team> => {
      return ensureEnvironmentVariableAccess({
        environment_variable_id: "environmentVariableId",
        logger,
        teams: null,
      });
    };

    await expect(testFn()).rejects.toThrowError("no teams");
  });

  it("throws an error if teams do not have access", async () => {
    const testFn = async (): Promise<Team> => {
      return ensureEnvironmentVariableAccess({
        environment_variable_id: "environmentVariable2Id",
        logger,
        teams,
      });
    };

    await expect(testFn()).rejects.toThrowError("cannot access environment");
  });

  it("returns selected team if teams have access", async () => {
    const team = await ensureEnvironmentVariableAccess({
      environment_variable_id: "environmentVariableId",
      logger,
      teams,
    });

    expect(team).toEqual(teams[0]);
  });
});

describe("ensureGroupAccess", () => {
  afterEach(jest.restoreAllMocks);

  it("throws an error if teams not provided", async () => {
    const testFn = async (): Promise<Team> => {
      return ensureGroupAccess({
        group_id: "groupId",
        logger,
        teams: null,
      });
    };

    await expect(testFn()).rejects.toThrowError("no teams");
  });

  it("throws an error if teams do not have access", async () => {
    jest.spyOn(groupModel, "findGroup").mockResolvedValue({
      id: "groupId",
      team_id: "anotherTeamId",
    } as Group);

    const testFn = async (): Promise<Team> => {
      return ensureGroupAccess({
        group_id: "groupId",
        logger,
        teams,
      });
    };

    await expect(testFn()).rejects.toThrowError("cannot access group");
  });

  it("returns selected team if teams have access", async () => {
    jest
      .spyOn(groupModel, "findGroup")
      .mockResolvedValue({ id: "groupId", team_id: "teamId" } as Group);

    const team = await ensureGroupAccess({
      group_id: "groupId",
      logger,
      teams,
    });

    expect(team).toEqual(teams[0]);
  });
});

describe("ensureTeamAccess", () => {
  it("throws an error if no teams provided", () => {
    const testFn = (): Team => {
      return ensureTeamAccess({ logger, team_id: "teamId", teams: null });
    };

    expect(testFn).toThrowError("no teams");
  });

  it("throws an error if teams do not have access", () => {
    const testFn = (): Team => {
      return ensureTeamAccess({
        logger,
        team_id: "anotherTeamId",
        teams,
      });
    };

    expect(testFn).toThrowError("cannot access team");
  });

  it("returns selected team if teams have access", () => {
    const selectedTeam = ensureTeamAccess({
      logger,
      team_id: "teamId",
      teams: teams,
    });

    expect(selectedTeam).toEqual(teams[0]);
  });
});

describe("ensureTeams", () => {
  it("throws an error if no teams provided", () => {
    const testFn = (): Team[] => {
      return ensureTeams({ logger, teams: null });
    };

    expect(testFn).toThrowError("no teams");
  });

  it("returns provided teams if possible", () => {
    expect(ensureTeams({ logger, teams })).toMatchObject([
      {
        id: "teamId",
        plan: "free",
      },
    ]);
  });
});

describe("ensureSuiteAccess", () => {
  it("throws an error if teams not provided", async () => {
    const testFn = async (): Promise<void> => {
      return ensureSuiteAccess({
        logger,
        teams: null,
        suite_id: "suiteId",
      });
    };

    await expect(testFn()).rejects.toThrowError("no teams");
  });

  it("throws an error if teams do not have access", async () => {
    jest.spyOn(suiteModel, "findSuite").mockResolvedValue(suite);

    const testFn = async (): Promise<void> => {
      return ensureSuiteAccess({
        logger,
        teams,
        suite_id: "suite2Id",
      });
    };

    await expect(testFn()).rejects.toThrowError("cannot access suite");
  });

  it("does not throw an error if teams have access", async () => {
    jest.spyOn(suiteModel, "findSuite").mockResolvedValue(suite);

    const testFn = async (): Promise<void> => {
      return ensureSuiteAccess({
        logger,
        teams: [{ ...teams[0], id: "team2Id" }],
        suite_id: "suiteId",
      });
    };

    await expect(testFn()).resolves.not.toThrowError();
  });
});

describe("ensureTestAccess", () => {
  afterEach(jest.restoreAllMocks);

  it("throws an error if teams not provided", async () => {
    const testFn = async (): Promise<Team> =>
      ensureTestAccess({ logger, teams: null, test_id: "testId" });

    await expect(testFn()).rejects.toThrowError("no teams");
  });

  it("throws an error if teams do not have access", async () => {
    jest.spyOn(testModel, "findTest").mockResolvedValue({
      team_id: "anotherTeamId",
      id: "testId",
    } as Test);

    const testFn = async (): Promise<Team> => {
      return ensureTestAccess({ logger, teams, test_id: "testId" });
    };

    await expect(testFn()).rejects.toThrowError("cannot access");
  });

  it("does not throw an error if teams have access", async () => {
    jest
      .spyOn(testModel, "findTest")
      .mockResolvedValue({ team_id: "teamId", id: "testId" } as Test);

    const testFn = async (): Promise<Team> => {
      return ensureTestAccess({
        logger,
        teams,
        test_id: "testId",
      });
    };

    await expect(testFn()).resolves.not.toThrowError();
  });

  it("allows passing a test instead of a test id", async () => {
    jest.spyOn(testModel, "findTest");

    const testFn = async (): Promise<Team> => {
      return ensureTestAccess({
        logger,
        teams,
        test: { team_id: "teamId", id: "testId" } as Test,
      });
    };

    await expect(testFn()).resolves.not.toThrowError();
    expect(testModel.findTest).not.toBeCalled();
  });
});

describe("ensureUser", () => {
  it("throws an error if no user provided", () => {
    const testFn = (): User => {
      return ensureUser({ logger, user: null });
    };

    expect(testFn).toThrowError("no user");
  });

  it("returns provided user if possible", () => {
    const user = { id: "userId" } as User;

    expect(ensureUser({ logger, user })).toEqual({ id: "userId" });
  });
});
