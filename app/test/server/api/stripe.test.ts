import Stripe from "stripe";

import * as stripeFunction from "../../../server/api/stripe";
import * as teamModel from "../../../server/models/team";
import { prepareTestDb } from "../db";
import { buildTeam, logger } from "../utils";

jest.mock("stripe");

const {
  handleCheckoutCompleted,
  handleInvoicePaid,
  shouldIgnoreInvoicePaidEvent,
} = stripeFunction;

const db = prepareTestDb();
const options = { db, logger };

beforeAll(() => {
  jest.spyOn(stripeFunction, "findMetadataForSubscription").mockResolvedValue({
    ignore_webhook: false,
    team_id: "teamId",
    plan: "business",
  });
});

describe("handleCheckoutCompleted", () => {
  beforeAll(() => {
    return db("teams").insert(buildTeam({}));
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
      is_enabled: true,
      plan: "business",
      renewed_at: expect.any(Date),
      stripe_customer_id: "stripeCustomerId",
      stripe_subscription_id: "stripeSubscriptionId",
    });
  });
});

describe("handleInvoicePaid", () => {
  beforeAll(() => {
    return db("teams").insert({
      ...buildTeam({}),
      renewed_at: null,
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
