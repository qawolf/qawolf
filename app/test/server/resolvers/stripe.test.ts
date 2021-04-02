import { createStripeCheckoutSessionResolver } from "../../../server/resolvers/stripe";
import { prepareTestDb } from "../db";
import { buildTeam, buildTeamUser, buildUser, testContext } from "../utils";

jest.mock("stripe", () => {
  return jest.fn().mockImplementation(() => {
    return {
      checkout: {
        sessions: {
          create: jest.fn().mockResolvedValue({ id: "stripeSessionId" }),
        },
      },
    };
  });
});

const teams = [buildTeam({})];
const user = buildUser({});

const db = prepareTestDb();
const context = { ...testContext, db };

beforeAll(async () => {
  await db("users").insert(user);
  await db("teams").insert(teams);
  await db("team_users").insert(buildTeamUser({}));
});

describe("createStripeCheckoutSessionResolver", () => {
  it("creates a Stripe session", async () => {
    const sessionId = await createStripeCheckoutSessionResolver(
      {},
      { cancel_uri: "/pricing", team_id: "teamId" },
      context
    );

    expect(sessionId).toBe("stripeSessionId");
  });
});
