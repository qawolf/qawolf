import environment from "../../../server/environment";
import { createGitHubSignInUrlResolver } from "../../../server/resolvers/auth";

describe("createGitHubSignInUrlResolver", () => {
  it("creates URL to sign in with GitHub", () => {
    const url = createGitHubSignInUrlResolver({}, { redirect_uri: "/tests" });

    expect(url).toMatch(
      `https://github.com/login/oauth/authorize?client_id=${environment.GITHUB_OAUTH_CLIENT_ID}&redirect_uri=http%3A%2F%2Flocalhost%3A3000%2Ftests&scope=user%3Aemail&state=`
    );
  });
});
