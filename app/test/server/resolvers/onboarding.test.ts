import { onboardingResolver } from "../../../server/resolvers/onboarding";
import { prepareTestDb } from "../db";
import { buildTeamUser, testContext } from "../utils";

const db = prepareTestDb();
const context = { ...testContext, db };

beforeAll(async () => {
  await db("users").insert({
    ...testContext.user,
    onboarded_at: new Date().toISOString(),
  });
  await db("teams").insert(testContext.teams);
  await db("team_users").insert(buildTeamUser({}));
});

afterAll(() => jest.restoreAllMocks());

describe("onboardingResolver", () => {
  it("returns the onboarding status for a user", async () => {
    const onboarding = await onboardingResolver(
      {},
      { team_id: "teamId" },
      context
    );

    expect(onboarding).toEqual({
      has_added_trigger_to_test: false,
      has_completed_tutorial: true,
      has_created_test: false,
      has_invited_user: false,
    });
  });
});
