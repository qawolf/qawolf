import { createEmail } from "../../../server/models/email";
import { prepareTestDb } from "../db";
import { buildTeam, logger } from "../utils";

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
          to: "teamId@qawolf.email",
        },
        options
      );

      const dbEmail = await db("emails").first();

      expect(dbEmail).toMatchObject(email);
    });
  });
});
