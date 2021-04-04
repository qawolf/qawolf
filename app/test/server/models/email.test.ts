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

    it("creates an inbound email", async () => {
      const email = await createEmail(
        {
          created_at: new Date("2021-01-01").toISOString(),
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

      expect(dbEmail).toMatchObject({
        ...email,
        created_at: new Date(email.created_at),
        is_outbound: false,
        to: "teamid@test.com",
      });
      expect(dbEmail.created_at).toEqual(new Date("2021-01-01"));
    });

    it("creates an outbound email", async () => {
      const email = await createEmail(
        {
          created_at: new Date("2021-01-01").toISOString(),
          from: "spirit@qawolf.com",
          is_outbound: true,
          html: "html",
          subject: "subject",
          team_id: "teamId",
          text: "text",
          to: "teamId@test.com",
        },
        options
      );

      const dbEmail = await db("emails").first();

      expect(dbEmail).toMatchObject({
        ...email,
        created_at: new Date(email.created_at),
        is_outbound: true,
        to: "teamid@test.com",
      });
      expect(dbEmail.created_at).toEqual(new Date("2021-01-01"));
    });
  });

  describe("deleteOldEmails", () => {
    beforeAll(() => {
      return db("emails").insert([
        buildEmail({
          created_at: minutesFromNow(-5 * 24 * 60),
        }),
        buildEmail({
          created_at: minutesFromNow(-32 * 24 * 60),
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
        buildEmail({ i: 2, to: "my_inbox@test.com" }),
        buildEmail({ i: 3, to: "another_inbox@test.com" }),
      ]);
    });

    afterAll(() => db("emails").del());

    it("returns newest matching email", async () => {
      const email = await findEmail(
        {
          created_after: new Date("2019").toISOString(),
          to: "My_Inbox@test.com",
        },
        options
      );

      expect(email).toMatchObject({ id: "email2Id", to: "my_inbox@test.com" });
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
