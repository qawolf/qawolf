import axios from "axios";
import querystring from "querystring";

import environment from "../../environment";
import { cuid } from "../../utils";

const GITHUB_URL = "https://github.com/login/oauth/";

type CreateUserAccessToken = {
  github_code: string;
  github_state: string;
};

export const createGitHubSignInUrl = (redirect_uri: string): string => {
  const queryString = querystring.stringify({
    client_id: environment.GITHUB_OAUTH_CLIENT_ID,
    redirect_uri: `${environment.APP_URL}${redirect_uri}`,
    scope: "user:email",
    state: cuid(),
  });

  return new URL(`authorize?${queryString}`, GITHUB_URL).href;
};

export const createUserAccessToken = async ({
  github_code,
  github_state,
}: CreateUserAccessToken): Promise<string> => {
  try {
    const { data } = await axios.post(
      new URL(`access_token`, GITHUB_URL).href,
      {
        client_id: environment.GITHUB_OAUTH_CLIENT_ID,
        client_secret: environment.GITHUB_OAUTH_CLIENT_SECRET,
        code: github_code,
        redirect_uri: environment.APP_URL,
        state: github_state,
      },
      {
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
      }
    );

    return data.access_token;
  } catch (error) {
    throw new Error("No access token returned by GitHub");
  }
};
