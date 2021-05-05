import * as suiteModel from "../../../server/models/suite";
import * as testModel from "../../../server/models/test";
import * as triggerModel from "../../../server/models/trigger";
import {
  ensureEnvironmentAccess,
  ensureEnvironmentVariableAccess,
  ensureSuiteAccess,
  ensureTagAccess,
  ensureTeamAccess,
  ensureTeams,
  ensureTestAccess,
  ensureTriggerAccess,
  ensureUser,
} from "../../../server/resolvers/utils";
import { Test, Trigger, User } from "../../../server/types";
import { prepareTestDb } from "../db";
import {
  buildEnvironment,
  buildEnvironmentVariable,
  buildSuite,
  buildTag,
  buildTeam,
  logger,
} from "../utils";

const teams = [buildTeam({})];
const suite = buildSuite({ team_id: "team2Id" });

const db = prepareTestDb();
const options = { db, logger };

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
    await expect(
      ensureEnvironmentAccess(
        {
          environment_id: "environmentId",
          teams: null,
        },
        options
      )
    ).rejects.toThrowError("no teams");
  });

  it("throws an error if teams do not have access", async () => {
    await expect(
      ensureEnvironmentAccess(
        {
          environment_id: "environment2Id",
          teams,
        },
        options
      )
    ).rejects.toThrowError("cannot access environment");
  });

  it("returns selected team if teams have access", async () => {
    const team = await ensureEnvironmentAccess(
      {
        environment_id: "environmentId",
        teams,
      },
      options
    );

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
    await expect(
      ensureEnvironmentVariableAccess(
        {
          environment_variable_id: "environmentVariableId",
          teams: null,
        },
        options
      )
    ).rejects.toThrowError("no teams");
  });

  it("throws an error if teams do not have access", async () => {
    await expect(
      ensureEnvironmentVariableAccess(
        {
          environment_variable_id: "environmentVariable2Id",
          teams,
        },
        options
      )
    ).rejects.toThrowError("cannot access environment");
  });

  it("returns selected team if teams have access", async () => {
    const team = await ensureEnvironmentVariableAccess(
      {
        environment_variable_id: "environmentVariableId",
        teams,
      },
      options
    );

    expect(team).toEqual(teams[0]);
  });
});

describe("ensureSuiteAccess", () => {
  it("throws an error if teams not provided", async () => {
    await expect(
      ensureSuiteAccess(
        {
          teams: null,
          suite_id: "suiteId",
        },
        options
      )
    ).rejects.toThrowError("no teams");
  });

  it("throws an error if teams do not have access", async () => {
    jest.spyOn(suiteModel, "findSuite").mockResolvedValue(suite);

    await expect(
      ensureSuiteAccess(
        {
          teams,
          suite_id: "suite2Id",
        },
        options
      )
    ).rejects.toThrowError("cannot access suite");
  });

  it("does not throw an error if teams have access", async () => {
    jest.spyOn(suiteModel, "findSuite").mockResolvedValue(suite);

    await expect(
      ensureSuiteAccess(
        {
          teams: [{ ...teams[0], id: "team2Id" }],
          suite_id: "suiteId",
        },
        options
      )
    ).resolves.not.toThrowError();
  });
});

describe("ensureTagAccess", () => {
  beforeAll(async () => {
    await db("teams").insert([buildTeam({}), buildTeam({ i: 2 })]);

    await db("tags").insert([
      buildTag({}),
      buildTag({ i: 2, team_id: "team2Id" }),
    ]);
  });

  afterAll(async () => {
    await db("tags").del();
    return db("teams").del();
  });

  it("throws an error if teams not provided", async () => {
    await expect(
      ensureTagAccess(
        {
          tag_id: "tagId",
          teams: null,
        },
        options
      )
    ).rejects.toThrowError("no teams");
  });

  it("throws an error if teams do not have access", async () => {
    await expect(
      ensureTagAccess(
        {
          tag_id: "tag2Id",
          teams,
        },
        options
      )
    ).rejects.toThrowError("cannot access tag");
  });

  it("returns selected team if teams have access", async () => {
    const team = await ensureTagAccess(
      {
        tag_id: "tagId",
        teams,
      },
      options
    );

    expect(team).toEqual(teams[0]);
  });
});

describe("ensureTeamAccess", () => {
  it("throws an error if no teams provided", async () => {
    expect(() =>
      ensureTeamAccess({ logger, team_id: "teamId", teams: null })
    ).toThrowError("no teams");
  });

  it("throws an error if teams do not have access", () => {
    expect(() =>
      ensureTeamAccess({
        logger,
        team_id: "anotherTeamId",
        teams,
      })
    ).toThrowError("cannot access team");
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
    expect(() => ensureTeams({ logger, teams: null })).toThrowError("no teams");
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

describe("ensureTestAccess", () => {
  afterEach(jest.restoreAllMocks);

  it("throws an error if teams not provided", async () => {
    await expect(
      ensureTestAccess({ teams: null, test_id: "testId" }, options)
    ).rejects.toThrowError("no teams");
  });

  it("throws an error if teams do not have access", async () => {
    jest.spyOn(testModel, "findTest").mockResolvedValue({
      team_id: "anotherTeamId",
      id: "testId",
    } as Test);

    await expect(
      ensureTestAccess({ teams, test_id: "testId" }, options)
    ).rejects.toThrowError("cannot access");
  });

  it("does not throw an error if teams have access", async () => {
    jest
      .spyOn(testModel, "findTest")
      .mockResolvedValue({ team_id: "teamId", id: "testId" } as Test);

    await expect(
      ensureTestAccess(
        {
          teams,
          test_id: "testId",
        },
        options
      )
    ).resolves.not.toThrowError();
  });

  it("allows passing a test instead of a test id", async () => {
    jest.spyOn(testModel, "findTest");

    await expect(
      ensureTestAccess(
        {
          teams,
          test: { team_id: "teamId", id: "testId" } as Test,
        },
        options
      )
    ).resolves.not.toThrowError();
    expect(testModel.findTest).not.toBeCalled();
  });
});

describe("ensureTriggerAccess", () => {
  afterEach(jest.restoreAllMocks);

  it("throws an error if teams not provided", async () => {
    await expect(
      ensureTriggerAccess(
        {
          teams: null,
          trigger_id: "triggerId",
        },
        options
      )
    ).rejects.toThrowError("no teams");
  });

  it("throws an error if teams do not have access", async () => {
    jest.spyOn(triggerModel, "findTrigger").mockResolvedValue({
      id: "triggerId",
      team_id: "anotherTeamId",
    } as Trigger);

    await expect(
      ensureTriggerAccess(
        {
          teams,
          trigger_id: "triggerId",
        },
        options
      )
    ).rejects.toThrowError("cannot access trigger");
  });

  it("returns selected team if teams have access", async () => {
    jest
      .spyOn(triggerModel, "findTrigger")
      .mockResolvedValue({ id: "triggerId", team_id: "teamId" } as Trigger);

    const team = await ensureTriggerAccess(
      {
        teams,
        trigger_id: "triggerId",
      },
      options
    );

    expect(team).toEqual(teams[0]);
  });
});

describe("ensureUser", () => {
  it("throws an error if no user provided", () => {
    expect(() => ensureUser({ logger, user: null })).toThrowError("no user");
  });

  it("returns provided user if possible", () => {
    const user = { id: "userId" } as User;

    expect(ensureUser({ logger, user })).toEqual({ id: "userId" });
  });
});
