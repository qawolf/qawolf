import { Octokit } from "@octokit/rest";

import environment from "../../environment";
import {
  GitHubEmail,
  GitHubFields,
  GitHubUser,
  SignInWithGitHubMutation,
} from "../../types";
import { createUserAccessToken } from "./auth";

const buildGitHubFields = (gitHubUser: GitHubUser): GitHubFields => {
  return {
    avatar_url: gitHubUser.avatar_url,
    email: gitHubUser.email,
    github_id: gitHubUser.id,
    github_login: gitHubUser.login,
    name: gitHubUser.name || null,
  };
};

export const findBestEmail = (emails: GitHubEmail[]): string => {
  const primaryEmail = emails.find((email) => email.primary && email.verified);
  if (primaryEmail) return primaryEmail.email;

  const verifiedEmail = emails.find((email) => email.verified);
  if (verifiedEmail) return verifiedEmail.email;

  if (emails.length) {
    return emails[0].email;
  }

  throw new Error("Email not found");
};

export const findGitHubUser = async (
  gitHubAccessToken: string
): Promise<GitHubUser> => {
  const octokit = new Octokit({
    auth: gitHubAccessToken,
    userAgent: environment.GITHUB_USER_AGENT,
  });

  try {
    const user = await octokit.users.getAuthenticated();

    const { data } = await octokit.users.listEmailsForAuthenticated();
    const email = findBestEmail(data as GitHubEmail[]).toLowerCase();

    return { ...user.data, email };
  } catch (error) {
    throw new Error(
      `Could not get GitHub user data, please try again: ${error.message}`
    );
  }
};

export const findGitHubFields = async ({
  github_code,
  github_state,
}: SignInWithGitHubMutation): Promise<GitHubFields> => {
  const gitHubAccessToken = await createUserAccessToken({
    github_code,
    github_state,
  });

  const gitHubUser = await findGitHubUser(gitHubAccessToken);

  return buildGitHubFields(gitHubUser);
};
