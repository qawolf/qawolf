import axios from "axios";

import { joinMailingListResolver } from "../../../server/resolvers/sendgrid";
import { testContext } from "../utils";

jest.mock("axios");

describe("joinMailingListResolver", () => {
  it("returns false if email is invalid", async () => {
    const result = await joinMailingListResolver(
      {},
      { email: "invalid" },
      testContext
    );

    expect(result).toBe(false);
  });

  it("returns false if SendGrid request errors", async () => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (axios.put as any).mockRejectedValue(new Error("demogorgon!"));

    const result = await joinMailingListResolver(
      {},
      { email: "valid@email.com" },
      testContext
    );

    expect(result).toBe(false);
  });

  it("returns true if SendGrid request successful", async () => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (axios.put as any).mockResolvedValue();

    const result = await joinMailingListResolver(
      {},
      { email: "valid@email.com" },
      testContext
    );

    expect(result).toBe(true);
  });
});
