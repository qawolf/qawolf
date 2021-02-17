import { emailResolver } from "../../../server/resolvers/email";
import { Email } from "../../../server/types";
import { minutesFromNow } from "../../../shared/utils";
import { prepareTestDb } from "../db";
import { buildEmail, buildTeam, buildUser, testContext } from "../utils";

const db = prepareTestDb();

beforeAll(async () => {
  await db("users").insert(buildUser({}));

  return db("teams").insert([
    buildTeam({ inbox: "inbox" }),
    buildTeam({ i: 2, inbox: "anotherInbox" }),
  ]);
});

describe("emailResolver", () => {
  beforeAll(() => {
    return db("emails").insert(buildEmail({ to: "inbox+abc@test.com" }));
  });

  afterAll(() => db("emails").del());

  it("returns matching email", async () => {
    const email = await emailResolver(
      {},
      {
        created_after: minutesFromNow(-2),
        to: "inbox+abc@test.com",
      },
      { ...testContext, db }
    );

    expect(email).toMatchObject({ id: "emailId" });
  });

  it("returns null if no matching email", async () => {
    const email = await emailResolver(
      {},
      {
        created_after: new Date().toISOString(),
        to: "inbox@test.com",
      },
      { ...testContext, db }
    );

    expect(email).toBeNull();
  });

  it("throws an error if user cannot access inbox", async () => {
    await expect(
      (): Promise<Email | null> => {
        return emailResolver(
          {},
          {
            created_after: new Date().toISOString(),
            to: "anotherInbox@test.com",
          },
          { ...testContext, db }
        );
      }
    ).rejects.toThrowError("cannot access");
  });
});
