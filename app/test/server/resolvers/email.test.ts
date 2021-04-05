import * as emailModel from "../../../server/models/email";
import { encrypt } from "../../../server/models/encrypt";
import {
  emailResolver,
  ensureCanSendEmail,
  sendEmailResolver,
} from "../../../server/resolvers/email";
import * as sendGridService from "../../../server/services/sendgrid";
import { prepareTestDb } from "../db";
import { buildEmail, buildTeam, buildUser, testContext } from "../utils";

const api_key = "qawolf_api_key";

const db = prepareTestDb();

const options = { db, logger: testContext.logger };
const team = {
  ...buildTeam({ inbox: "inbox@dev.qawolf.email" }),
  api_key: encrypt(api_key),
};

beforeAll(async () => {
  await db("users").insert(buildUser({}));

  return db("teams").insert(team);
});

describe("emailResolver", () => {
  beforeAll(() => {
    return db("emails").insert({
      ...buildEmail({ to: "inbox+abc@dev.qawolf.email" }),
      created_at: new Date("2021-02-18T18:47:56.000Z"),
    });
  });

  afterAll(() => db("emails").del());

  it("returns matching email", async () => {
    const email = await emailResolver(
      {},
      {
        created_after: new Date("2021-02-18T18:47:56.646Z").toISOString(),
        to: "inbox+abc@dev.qawolf.email",
      },
      { ...testContext, api_key, db }
    );

    expect(email).toMatchObject({ id: "emailId" });
  });

  it("returns null if no matching email", async () => {
    const email = await emailResolver(
      {},
      {
        created_after: new Date().toISOString(),
        to: "inbox@dev.qawolf.email",
      },
      { ...testContext, api_key, db }
    );

    expect(email).toBeNull();
  });

  it("throws an error if api key cannot access team", async () => {
    await expect(
      emailResolver(
        {},
        {
          created_after: new Date().toISOString(),
          to: "anotherInbox@test.com",
        },
        { ...testContext, api_key: "fakeApiKey", db }
      )
    ).rejects.toThrowError("unauthorized");
  });
});

describe("ensureCanSendEmail", () => {
  it("throws an error if team on the free plan", async () => {
    await expect(ensureCanSendEmail(team, options)).rejects.toThrowError(
      "contact us"
    );
  });

  it("throws an error if team has reached email limit", async () => {
    jest
      .spyOn(emailModel, "countOutboundEmailsForTeam")
      .mockResolvedValueOnce(1500);

    await expect(
      ensureCanSendEmail({ ...team, plan: "business" }, options)
    ).rejects.toThrowError("maximum number of emails");
  });

  it("does not throw an error otherwise", async () => {
    jest
      .spyOn(emailModel, "countOutboundEmailsForTeam")
      .mockResolvedValueOnce(1);

    await expect(
      ensureCanSendEmail({ ...team, plan: "business" }, options)
    ).resolves.not.toThrowError();
  });
});

describe("sendEmailResolver", () => {
  beforeAll(() => db("teams").update({ plan: "business" }));

  afterAll(() => db("teams").update({ plan: "free" }));

  const email = {
    from: "inbox@dev.qawolf.email",
    subject: "Test",
    text: "Content",
    to: "test@other.com",
  };

  it("sends an email and creates a record in the database", async () => {
    jest.spyOn(sendGridService, "sendEmail").mockResolvedValue();

    await sendEmailResolver({}, email, {
      ...testContext,
      api_key,
      db,
    });

    expect(sendGridService.sendEmail).toBeCalledWith(email);

    const dbEmail = await db("emails").first();

    expect(dbEmail).toMatchObject({ ...email, team_id: "teamId" });
  });

  it("throws an error if api key cannot access team", async () => {
    await expect(
      sendEmailResolver({}, email, {
        ...testContext,
        api_key: "fakeApiKey",
        db,
      })
    ).rejects.toThrowError("unauthorized");
  });
});
