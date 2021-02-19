import { encrypt } from "../../../server/models/encrypt";
import { emailResolver } from "../../../server/resolvers/email";
import { Email } from "../../../server/types";
import { prepareTestDb } from "../db";
import { buildEmail, buildTeam, buildUser, testContext } from "../utils";

const api_key = "qawolf_api_key";

const db = prepareTestDb();

beforeAll(async () => {
  await db("users").insert(buildUser({}));

  return db("teams").insert({
    ...buildTeam({ inbox: "inbox@dev.qawolf.email" }),
    api_key: encrypt(api_key),
  });
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
      (): Promise<Email | null> => {
        return emailResolver(
          {},
          {
            created_after: new Date().toISOString(),
            to: "anotherInbox@test.com",
          },
          { ...testContext, api_key: "fakeApiKey", db }
        );
      }
    ).rejects.toThrowError("Unauthorized");
  });
});
