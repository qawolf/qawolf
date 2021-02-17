import {
  createEmail,
  deleteOldEmails,
  findEmail,
} from "../../../server/models/email";
import { minutesFromNow } from "../../../shared/utils";
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
          from: "spirit@qawolf.com",
          html: "html",
          subject: "subject",
          team_id: "teamId",
          text: "text",
          to: "teamId@test.com",
        },
        options
      );

      const dbEmail = await db("emails").first();

      expect(dbEmail).toMatchObject({ ...email, to: "teamid@test.com" });
    });
  });

  describe("deleteOldEmails", () => {
    beforeAll(() => {
      return db("emails").insert([
        buildEmail({
          created_at: minutesFromNow(-55),
        }),
        buildEmail({
          created_at: minutesFromNow(-65),
          i: 2,
        }),
        buildEmail({
          created_at: new Date("2000").toISOString(),
          i: 3,
        }),
        buildEmail({ i: 4 }),
      ]);
    });

    afterAll(() => db("emails").del());

    it("deletes old emails", async () => {
      await deleteOldEmails(options);

      const emails = await db("emails").orderBy("created_at", "asc");

      expect(emails).toMatchObject([{ id: "emailId" }, { id: "email4Id" }]);
    });
  });

  describe("findEmail", () => {
    beforeAll(() => {
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
