import { createGitHubSignInUrl } from "../services/gitHub/auth";
import { CreateUrlMutation } from "../types";

export const createGitHubSignInUrlResolver = (
  _: Record<string, unknown>,
  { redirect_uri }: CreateUrlMutation
): string => {
  return createGitHubSignInUrl(redirect_uri);
};
