import { hashUserId } from "../../../server/services/intercom";

describe("hashUserId", () => {
  it("hashes the user id with hmac", () => {
    expect(hashUserId("1")).toEqual(
      "bd28ee142ca5b46259f6e27fc3a4216f447bd5843c406e63219cff30e73b135b"
    );
  });
});
