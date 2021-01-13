import * as authService from "../../../../server/services/gitHub/auth";
import {
  findBestEmail,
  findGitHubFields,
  findGitHubUser,
} from "../../../../server/services/gitHub/user";
import { GitHubUser } from "../../../../server/types";

afterAll(jest.restoreAllMocks);

describe("findBestEmail", () => {
  it("returns primary and verified email", () => {
    const emails = [
      {
        email: "spirit@qawolf.com",
        primary: false,
        verified: true,
      },
      {
        email: "noodle@qawolf.com",
        primary: true,
        verified: true,
      },
    ];
    expect(findBestEmail(emails)).toBe("noodle@qawolf.com");
  });

  it("returns first verified email if no primary email", () => {
    const emails = [
      {
        email: "spirit@qawolf.com",
        primary: false,
        verified: false,
      },
      {
        email: "noodle@qawolf.com",
        primary: false,
        verified: true,
      },
    ];
    expect(findBestEmail(emails)).toBe("noodle@qawolf.com");
  });

  it("returns first email if no primary or verified emails", () => {
    const emails = [
      {
        email: "spirit@qawolf.com",
        primary: false,
        verified: false,
      },
      {
        email: "noodle@qawolf.com",
        primary: false,
        verified: false,
      },
    ];
    expect(findBestEmail(emails)).toBe("spirit@qawolf.com");
  });

  it("throws an error if no email found", () => {
    expect(() => findBestEmail([])).toThrowError();
  });
});

describe("findGitHubFields", () => {
  it("returns GitHub fields for user", async () => {
    const accessToken = process.env.TEST_GITHUB_ACCESS_TOKEN || "";
    jest
      .spyOn(authService, "createUserAccessToken")
      .mockReturnValue(Promise.resolve(accessToken));

    const fields = await findGitHubFields({
      github_code: "code",
      github_state: "state",
    });

    expect(fields).toMatchObject({
      email: "spirit@qawolf.com",
      github_login: "your-qawolf",
      name: "Your QA Wolf",
    });

    expect(authService.createUserAccessToken).toBeCalledWith({
      github_code: "code",
      github_state: "state",
    });
  });
});

describe("findGitHubUser", () => {
  it("returns GitHub user data from access token", async () => {
    const user = await findGitHubUser(
      process.env.TEST_GITHUB_ACCESS_TOKEN || ""
    );

    expect(user).toMatchObject({
      email: "spirit@qawolf.com",
      login: "your-qawolf",
      name: "Your QA Wolf",
    });
  });

  it("throws error if access token is inavlid", async () => {
    const testFn = async (): Promise<GitHubUser> => findGitHubUser("invalid");

    await expect(testFn()).rejects.toThrowError(
      "Could not get GitHub user data"
    );
  });
});
