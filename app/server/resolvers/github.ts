import {
  createIntegrations,
  deleteIntegrations,
  findIntegration,
  findIntegrationsForTeam,
} from "../models/integration";
import { findBranchesForIntegration } from "../services/gitHub/branch";
import { findGitHubReposForInstallation } from "../services/gitHub/commitStatus";
import {
  Context,
  CreateGitHubIntegrationsMutation,
  GitHubBranch,
  Integration,
  TeamIdQuery,
} from "../types";
import { ensureTeamAccess } from "./utils";

// we do this here instead of listening to the GitHub webhook because
// we cannot identify which team installed the app in the webhook payload
export const createGitHubIntegrationsResolver = async (
  _: Record<string, unknown>,
  { installation_id, is_sync, team_id }: CreateGitHubIntegrationsMutation,
  { db, logger, teams }: Context
): Promise<Integration[]> => {
  ensureTeamAccess({ logger, team_id, teams });

  return db.transaction(async (trx) => {
    const repos = await findGitHubReposForInstallation(
      { installationId: installation_id, isSync: is_sync },
      {
        db: trx,
        logger,
      }
    );

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
            type: is_sync ? "github_sync" : "github",
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

export const gitHubBranchesResolver = async (
  _: Record<string, unknown>,
  { team_id }: TeamIdQuery,
  { db, logger, teams }: Context
): Promise<GitHubBranch[] | null> => {
  const log = logger.prefix("gitHubBranchesResolver");
  log.debug("team", team_id);

  const team = ensureTeamAccess({ logger, team_id, teams });
  if (!team.git_sync_integration_id) {
    log.debug("skip, no git sync integration");
    return null;
  }

  const integration = await findIntegration(team.git_sync_integration_id, {
    db,
    logger,
  });

  return findBranchesForIntegration(integration, { db, logger });
};
