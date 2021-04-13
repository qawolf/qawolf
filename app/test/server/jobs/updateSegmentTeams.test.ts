import { shouldRenew, syncTeam } from "../../../server/jobs/updateSegmentTeams";
import { daysFromNow } from "../../../shared/utils";
import { prepareTestDb } from "../db";
import { buildTeam, logger } from "../utils";

const db = prepareTestDb();
const options = { db, logger };

describe("shouldRenew", () => {
  const team = buildTeam({});

  it("returns false if team not on free plan", () => {
    expect(shouldRenew({ ...team, plan: "business" as const }, logger)).toBe(
      false
    );
  });

  it("returns false if team renewed recently", () => {
    expect(
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      shouldRenew({ ...team, renewed_at: new Date() as any }, logger)
    ).toBe(false);

    expect(shouldRenew({ ...team, renewed_at: daysFromNow(-29) }, logger)).toBe(
      false
    );
  });

  it("returns true otherwise", () => {
    expect(shouldRenew({ ...team, renewed_at: daysFromNow(-31) }, logger)).toBe(
      true
    );
  });
});

describe("syncTeam", () => {
  const timestamp = new Date().toISOString();

  const team = buildTeam({
    limit_reached_at: timestamp,
    renewed_at: daysFromNow(-31),
  });

  beforeAll(() => db("teams").insert(team));

  afterAll(() => db("teams").del());

  it("does not renew if team not on free plan", async () => {
    const modifiedTeam = {
      ...team,
      plan: "business" as const,
    };

    const syncedTeam = await syncTeam(modifiedTeam, options);

    expect(syncedTeam).toMatchObject({
      id: "teamId",
      last_synced_at: expect.any(String),
      limit_reached_at: new Date(timestamp),
      renewed_at: new Date(team.renewed_at),
    });
  });

  it("does not renew if team renewed recently", async () => {
    const modifiedTeam = {
      ...team,
      renewed_at: daysFromNow(-1),
    };

    const syncedTeam = await syncTeam(modifiedTeam, options);

    expect(syncedTeam).toMatchObject({
      id: "teamId",
      last_synced_at: expect.any(String),
      limit_reached_at: new Date(timestamp),
      renewed_at: new Date(team.renewed_at),
    });
  });

  it("renews team otherwise", async () => {
    const syncedTeam = await syncTeam(team, options);

    expect(syncedTeam).toMatchObject({
      limit_reached_at: null,
      renewed_at: expect.any(String),
      last_synced_at: expect.any(String),
    });
    expect(syncedTeam.renewed_at > daysFromNow(-1)).toBe(true);
  });
});
