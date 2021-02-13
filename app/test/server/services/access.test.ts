jest.mock("jsonwebtoken");
import jwt from "jsonwebtoken";

import {
  signAccessToken,
  verifyAccessToken,
} from "../../../server/services/access";

describe("signAccessToken", () => {
  it("signs an access token", () => {
    /* eslint-disable-next-line  @typescript-eslint/no-explicit-any */
    (jwt.sign as any).mockReturnValue("signedToken");

    const token = signAccessToken("userId");
    expect(token).toBe("signedToken");
  });
});

describe("verifyAccessToken", () => {
  it("verifies an access token", () => {
    /* eslint-disable-next-line  @typescript-eslint/no-explicit-any */
    (jwt.verify as any).mockReturnValue({ user_id: "userId" });

    const userId = verifyAccessToken("token");
    expect(userId).toBe("userId");
  });

  it("returns null if no user id", () => {
    /* eslint-disable-next-line  @typescript-eslint/no-explicit-any */
    (jwt.verify as any).mockReturnValue({});

    const userId = verifyAccessToken("token");
    expect(userId).toBeNull();
  });
});
