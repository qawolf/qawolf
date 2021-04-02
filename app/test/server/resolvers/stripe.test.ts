import {
  createStripeCheckoutSessionResolver,
  createStripePortalSessionResolver,
} from "../../../server/resolvers/stripe";
import { prepareTestDb } from "../db";
import { buildTeam, buildTeamUser, buildUser, testContext } from "../utils";

jest.mock("stripe", () => {
  return jest.fn().mockImplementation(() => {
    return {
      billingPortal: {
        sessions: {
          create: jest.fn().mockResolvedValue({ url: "url" }),
        },
      },
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
      {
        app_url: "https://www.qawolf.com",
        cancel_uri: "/pricing",
        team_id: "teamId",
      },
      context
    );

    expect(sessionId).toBe("stripeSessionId");
  });
});

describe("createStripePortalSessionResolver", () => {
  it("throws an error if no stripe customer for team", async () => {
    const testFn = async (): Promise<string> => {
      return createStripePortalSessionResolver(
        {},
        {
          app_url: "https://www.qawolf.com",
          return_uri: "/settings",
          team_id: "teamId",
        },
        context
      );
    };

    await expect(testFn()).rejects.toThrowError("No Stripe subscription");
  });

  it("creates a Stripe session", async () => {
    const sessionId = await createStripePortalSessionResolver(
      {},
      {
        app_url: "https://www.qawolf.com",
        return_uri: "/settings",
        team_id: "teamId",
      },
      { ...context, teams: [{ ...teams[0], stripe_customer_id: "customerId" }] }
    );

    expect(sessionId).toBe("url");
  });
});
