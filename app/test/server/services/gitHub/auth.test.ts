import axios from "axios";

import environment from "../../../../server/environment";
import {
  createGitHubSignInUrl,
  createUserAccessToken,
} from "../../../../server/services/gitHub/auth";

jest.mock("axios");

afterAll(jest.restoreAllMocks);

describe("createGitHubSignInUrl", () => {
  it("creates URL to sign in with GitHub", () => {
    const url = createGitHubSignInUrl("/tests");

    expect(url).toMatch(
      `https://github.com/login/oauth/authorize?client_id=${environment.GITHUB_OAUTH_CLIENT_ID}&redirect_uri=http%3A%2F%2Flocalhost%3A3000%2Ftests&scope=user%3Aemail&state=`
    );
  });
});

describe("createUserAccessToken", () => {
  it("returns GitHub access token", async () => {
    /* eslint-disable-next-line @typescript-eslint/no-explicit-any */
    (axios.post as any).mockResolvedValue({ data: { access_token: "token" } });

    const token = await createUserAccessToken({
      github_code: "123",
      github_state: "state",
    });

    expect(token).toBe("token");
  });

  it("throws an error if no access token returned by GitHub", async () => {
    /* eslint-disable-next-line @typescript-eslint/no-explicit-any */
    (axios.post as any).mockRejectedValue(new Error("demogorgon!"));

    const testFn = async (): Promise<string> =>
      createUserAccessToken({
        github_code: "123",
        github_state: "state",
      });

    await expect(testFn()).rejects.toThrowError(
      "No access token returned by GitHub"
    );
  });
});
