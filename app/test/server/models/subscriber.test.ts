import { createSubscriber } from "../../../server/models/subscriber";
import { prepareTestDb } from "../db";
import { logger } from "../utils";

const db = prepareTestDb();
const options = { db, logger };

const email = "test@qawolf.com";

describe("subscriber model", () => {
  describe("createSubscriber", () => {
    afterEach(() => db("subscribers").del());

    it("creates a subscriber", async () => {
      const subscriber = await createSubscriber(email, options);

      expect(subscriber).toMatchObject({ email, id: expect.any(String) });

      const dbSubscriber = await db("subscribers");

      expect(dbSubscriber).toMatchObject([{ email }]);
    });

    it("does not create subscriber for existing email", async () => {
      await db("subscribers").insert({
        email,
        id: "subscriberId",
      });
      const subscriber = await createSubscriber(email, options);

      expect(subscriber).toBeNull();

      const dbSubscribers = await db("subscribers");

      expect(dbSubscribers).toMatchObject([{ email, id: "subscriberId" }]);
    });

    it("does not create subscriber for invalid email", async () => {
      const subscriber = await createSubscriber("invalid", options);

      expect(subscriber).toBeNull();

      const dbSubscriber = await db("subscribers");

      expect(dbSubscriber).toEqual([]);
    });
  });
});
