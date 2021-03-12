import { wolfResolver } from "../../../server/resolvers/wolf";
import { Wolf } from "../../../server/types";
import { prepareTestDb } from "../db";
import { buildUser, testContext } from "../utils";

const db = prepareTestDb();
const context = { ...testContext, db };

const user = buildUser({});

beforeAll(() => db("users").insert(user));

describe("wolfResolver", () => {
  it("returns a wolf for a user", async () => {
    const wolf = await wolfResolver({}, { user_id: "userId" }, context);

    expect(wolf).toEqual({
      name: user.wolf_name,
      number: user.wolf_number,
      variant: user.wolf_variant,
    });
  });

  it("throws an error if user not found", async () => {
    const testFn = (): Promise<Wolf> => {
      return wolfResolver({}, { user_id: "fakeId" }, context);
    };

    await expect(testFn()).rejects.toThrowError("not found");
  });
});
