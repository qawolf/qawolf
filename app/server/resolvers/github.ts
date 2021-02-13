import {
  createIntegrations,
  deleteIntegrations,
  findIntegrationsForTeam,
} from "../models/integration";
import { findGitHubReposForInstallation } from "../services/gitHub/app";
import {
  Context,
  CreateGitHubIntegrationsMutation,
  Integration,
} from "../types";
import { ensureTeamAccess } from "./utils";

// we do this here instead of listening to the GitHub webhook because
// we cannot identify which team installed the app in the webhook payload
export const createGitHubIntegrationsResolver = async (
  _: Record<string, unknown>,
  { installation_id, team_id }: CreateGitHubIntegrationsMutation,
  { db, logger, teams }: Context
): Promise<Integration[]> => {
  ensureTeamAccess({ logger, team_id, teams });

  return db.transaction(async (trx) => {
    const repos = await findGitHubReposForInstallation(installation_id, {
      db: trx,
      logger,
    });

    const integrations = await findIntegrationsForTeam(
      { github_installation_id: installation_id, team_id },
      {
        db: trx,
        logger,
      }
    );

    const newIntegrations = await createIntegrations(
      repos
        .filter((r) => {
          // find which repos do not have a corresponding integration
          return !integrations.some((i) => i.github_repo_id === r.id);
        })
        .map((r) => {
          return {
            github_installation_id: installation_id,
            github_repo_id: r.id,
            github_repo_name: r.full_name,
            settings_url: `https://github.com/settings/installations/${installation_id}`,
            team_id,
            type: "github",
          };
        }),
      { db: trx, logger }
    );

    await deleteIntegrations(
      integrations
        .filter((i) => {
          // find which integrations do not have a corresponding repo in GitHub
          return !repos.some((r) => i.github_repo_id === r.id);
        })
        .map((i) => i.id),
      { db: trx, logger }
    );

    return newIntegrations;
  });
};
