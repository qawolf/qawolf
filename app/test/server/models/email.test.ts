import {
  countOutboundEmailsForTeam,
  createEmail,
  deleteOldEmails,
  findEmail,
} from "../../../server/models/email";
import { minutesFromNow } from "../../../shared/utils";
import { prepareTestDb } from "../db";
import { buildEmail, buildTeam, logger } from "../utils";

const db = prepareTestDb();
const options = { db, logger };

beforeAll(() => db("teams").insert([buildTeam({}), buildTeam({ i: 2 })]));

describe("email model", () => {
  describe("countOutboundEmailsForTeam", () => {
    beforeAll(() => {
      return db("emails").insert([
        buildEmail({ is_outbound: true }),
        buildEmail({ i: 2, is_outbound: true }),
        buildEmail({ i: 3, is_outbound: false }),
        buildEmail({
          i: 4,
          team_id: "team2Id",
        }),
      ]);
    });

    afterAll(() => db("emails").del());

    it("returns the count of emails belonging to a team", async () => {
      const count = await countOutboundEmailsForTeam("teamId", options);

      expect(count).toBe(2);

      const count2 = await countOutboundEmailsForTeam("fakeId", options);

      expect(count2).toBe(0);
    });
  });

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
          from: "spirit@qawolf.com",
          is_outbound: true,
          html: "html",
          subject: "subject",
          team_id: "teamId",
          to: "teamId@test.com",
        },
        options
      );

      const dbEmail = await db("emails").first();

      expect(dbEmail).toMatchObject({
        ...email,
        created_at: new Date(email.created_at),
        is_outbound: true,
        text: "",
        to: "teamid@test.com",
      });
      expect(dbEmail.created_at).not.toEqual(new Date("2021-01-01"));
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
