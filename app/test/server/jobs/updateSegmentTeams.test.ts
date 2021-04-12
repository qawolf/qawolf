import { renewTeam } from "../../../server/jobs/updateSegmentTeams";
import * as teamModel from "../../../server/models/team";
import { daysFromNow } from "../../../shared/utils";
import { prepareTestDb } from "../db";
import { buildTeam, logger } from "../utils";

const db = prepareTestDb();
const options = { db, logger };

describe("renewTeam", () => {
  const team = buildTeam({
    limit_reached_at: new Date().toISOString(),
    renewed_at: daysFromNow(-31),
  });

  beforeAll(() => db("teams").insert(team));

  afterAll(() => db("teams").del());

  it("does nothing if team not on free plan", async () => {
    jest.spyOn(teamModel, "updateTeam");

    const modifiedTeam = {
      ...team,
      plan: "business" as const,
    };

    const renewedTeam = await renewTeam(modifiedTeam, options);

    expect(renewedTeam).toEqual(modifiedTeam);

    expect(teamModel.updateTeam).not.toBeCalled();
  });

  it("does nothing if team renewed recently", async () => {
    jest.spyOn(teamModel, "updateTeam");

    const modifiedTeam = {
      ...team,
      renewed_at: daysFromNow(-1),
    };

    const renewedTeam = await renewTeam(modifiedTeam, options);

    expect(renewedTeam).toEqual(modifiedTeam);

    expect(teamModel.updateTeam).not.toBeCalled();
  });

  it("renews team otherwise", async () => {
    jest.spyOn(teamModel, "updateTeam");

    const renewedTeam = await renewTeam(team, options);

    expect(renewedTeam).toMatchObject({
      limit_reached_at: null,
      renewed_at: expect.any(String),
    });
    expect(renewedTeam.renewed_at > daysFromNow(-1)).toBe(true);

    expect(teamModel.updateTeam).toBeCalled();
  });
});
