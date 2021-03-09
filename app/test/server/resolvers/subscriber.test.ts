import { createSubscriberResolver } from "../../../server/resolvers/subscriber";
import { prepareTestDb } from "../db";
import { testContext } from "../utils";

const db = prepareTestDb();
const context = { ...testContext, db };

describe("createSubscriberResolver", () => {
  it("creates a subscriber", async () => {
    const result = await createSubscriberResolver(
      {},
      { email: "test@qawolf.com" },
      context
    );

    expect(result).toBe(true);

    const subscriber = await db("subscribers").first();

    expect(subscriber).toMatchObject({ email: "test@qawolf.com" });
  });
});
