import { createEmail, findEmail } from "../../../server/models/email";
import { prepareTestDb } from "../db";
import { buildEmail, buildTeam, logger } from "../utils";

const db = prepareTestDb();
const options = { db, logger };

beforeAll(() => db("teams").insert(buildTeam({})));

describe("email model", () => {
  describe("createEmail", () => {
    afterEach(() => db("emails").del());

    it("creates an email", async () => {
      const email = await createEmail(
        {
          body: "body",
          from: "spirit@qawolf.com",
          subject: "subject",
          team_id: "teamId",
          to: "teamId@test.com",
        },
        options
      );

      const dbEmail = await db("emails").first();

      expect(dbEmail).toMatchObject(email);
    });
  });

  describe("findEmail", () => {
    beforeAll(async () => {
      return db("emails").insert([
        buildEmail({
          created_at: new Date("2020").toISOString(),
          to: "myInbox@test.com",
        }),
        buildEmail({ i: 2, to: "myInbox@test.com" }),
        buildEmail({ i: 3, to: "anotherInbox@test.com" }),
      ]);
    });

    afterAll(() => db("emails").del());

    it("returns newest matching email", async () => {
      const email = await findEmail(
        {
          created_after: new Date("2019").toISOString(),
          to: "myInbox@test.com",
        },
        options
      );

      expect(email).toMatchObject({ id: "email2Id", to: "myInbox@test.com" });
    });

    it("returns null if no matching email exists", async () => {
      const email = await findEmail(
        {
          created_after: new Date("2020").toISOString(),
          to: "fake@test.com",
        },
        options
      );

      expect(email).toBeNull();
    });
  });
});
