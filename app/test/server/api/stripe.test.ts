import Stripe from "stripe";

import * as stripeFunction from "../../../server/api/stripe";
import * as syncTeams from "../../../server/jobs/syncTeams";
import * as teamModel from "../../../server/models/team";
import { prepareTestDb } from "../db";
import { buildTeam, logger } from "../utils";

jest.mock("stripe");

const {
  handleCheckoutCompleted,
  handleCustomerSubscriptionDeleted,
  handleInvoicePaid,
  shouldIgnoreInvoicePaidEvent,
} = stripeFunction;

const db = prepareTestDb();
const options = { db, logger };

const syncTeamSpy = jest.spyOn(syncTeams, "syncTeam").mockResolvedValue();

beforeAll(() => {
  jest.spyOn(stripeFunction, "findMetadataForSubscription").mockResolvedValue({
    ignore_webhook: false,
    team_id: "teamId",
    plan: "business",
  });
});

describe("handleCheckoutCompleted", () => {
  beforeAll(() => {
    return db("teams").insert(
      buildTeam({ limit_reached_at: new Date().toISOString() })
    );
  });

  afterAll(() => db("teams").del());

  it("updates a team with subscription details", async () => {
    await handleCheckoutCompleted(
      {
        customer: "stripeCustomerId",
        subscription: "stripeSubscriptionId",
      } as Stripe.Checkout.Session,
      options
    );

    const team = await db.select("*").from("teams").first();

    expect(team).toMatchObject({
      limit_reached_at: null,
      plan: "business",
      renewed_at: expect.any(Date),
      stripe_customer_id: "stripeCustomerId",
      stripe_subscription_id: "stripeSubscriptionId",
    });

    expect(syncTeamSpy).toHaveBeenCalledTimes(1);
    expect(syncTeamSpy.mock.calls[0][0]).toMatchObject({ id: team.id });
  });
});

describe("handleCustomerSubscriptionDeleted", () => {
  beforeAll(() => {
    return db("teams").insert({
      ...buildTeam({ plan: "business" }),
      stripe_customer_id: "stripeCustomerId",
      stripe_subscription_id: "stripeSubscriptionId",
    });
  });

  afterAll(() => db("teams").del());

  it("reverts team to free plan", async () => {
    await handleCustomerSubscriptionDeleted(
      {
        id: "stripeSubscriptionId",
      } as Stripe.Subscription,
      options
    );

    const team = await db.select("*").from("teams").first();

    expect(team).toMatchObject({
      limit_reached_at: null,
      plan: "free",
      renewed_at: expect.any(Date),
      stripe_customer_id: null,
      stripe_subscription_id: null,
    });
  });
});

describe("handleInvoicePaid", () => {
  beforeAll(() => {
    return db("teams").insert({
      ...buildTeam({ limit_reached_at: new Date().toISOString() }),
      stripe_subscription_id: "stripeSubscriptionId",
    });
  });

  afterAll(() => db("teams").del());

  it("renews team subscription", async () => {
    await handleInvoicePaid(
      { subscription: "stripeSubscriptionId" } as Stripe.Invoice,
      options
    );

    const team = await db.select("*").from("teams").first();

    expect(team).toMatchObject({
      is_enabled: true,
      limit_reached_at: null,
      renewed_at: expect.any(Date),
      stripe_subscription_id: "stripeSubscriptionId",
    });
  });

  it("does nothing if should ignore webhook", async () => {
    jest
      .spyOn(stripeFunction, "findMetadataForSubscription")
      .mockResolvedValue({
        ignore_webhook: true,
        team_id: "teamId",
        plan: "business",
      });
    jest.spyOn(teamModel, "updateTeam");

    await handleInvoicePaid(
      { subscription: "stripeSubscriptionId" } as Stripe.Invoice,
      options
    );

    expect(teamModel.updateTeam).not.toBeCalled();

    jest
      .spyOn(stripeFunction, "findMetadataForSubscription")
      .mockResolvedValue({
        ignore_webhook: false,
        team_id: "teamId",
        plan: "business",
      });
  });
});

describe("shouldIgnoreInvoicePaidEvent", () => {
  it("returns true if first invoice", () => {
    expect(
      shouldIgnoreInvoicePaidEvent(
        { billing_reason: "subscription_create" } as Stripe.Invoice,
        options
      )
    ).toBe(true);
  });

  it("returns true otherwise", () => {
    expect(
      shouldIgnoreInvoicePaidEvent(
        { billing_reason: "subscription" } as Stripe.Invoice,
        options
      )
    ).toBe(false);
  });
});
