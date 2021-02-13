import isNil from "lodash/isNil";

import { Integration, IntegrationType, ModelOptions } from "../types";
import { cuid } from "../utils";

type CreateIntegration = {
  github_installation_id?: number;
  github_repo_id?: number;
  github_repo_name?: string;
  settings_url?: string;
  slack_channel?: string;
  team_id: string;
  team_name?: string;
  type: IntegrationType;
  webhook_url?: string;
};

type FindIntegrationsForTeam = {
  github_installation_id?: number;
  team_id: string;
};

const buildIntegration = ({
  github_installation_id,
  github_repo_id,
  github_repo_name,
  settings_url,
  slack_channel,
  team_id,
  team_name,
  type,
  webhook_url,
}: CreateIntegration): Integration => {
  return {
    github_installation_id: github_installation_id || null,
    github_repo_id: github_repo_id || null,
    github_repo_name: github_repo_name || null,
    id: cuid(),
    settings_url: settings_url || null,
    slack_channel: slack_channel || null,
    team_id,
    team_name: team_name || null,
    type,
    webhook_url: webhook_url || null,
  };
};

export const createIntegration = async (
  options: CreateIntegration,
  { db, logger }: ModelOptions
): Promise<Integration> => {
  const log = logger.prefix("createIntegration");
  log.debug(`team ${options.team_id}`);

  const integration = buildIntegration(options);
  await db("integrations").insert(integration);

  log.debug("created", integration.id);

  return integration;
};

export const createIntegrations = async (
  options: CreateIntegration[],
  { db, logger }: ModelOptions
): Promise<Integration[]> => {
  const log = logger.prefix("createIntegrations");

  const integrations = options.map((o) => buildIntegration(o));
  await db("integrations").insert(integrations);

  log.debug(
    "created",
    integrations.map((i) => i.id)
  );

  return integrations;
};

export const deleteIntegrations = async (
  ids: string[],
  { db, logger }: ModelOptions
): Promise<Integration[]> => {
  const log = logger.prefix("deleteIntegrations");
  log.debug("integrations", ids);

  const integrations = await db("integrations").select("*").whereIn("id", ids);

  const integrationIds = integrations.map((i) => i.id);

  // remove deleted deployment integrations from associated triggers
  await db("triggers")
    .whereIn("deployment_integration_id", integrationIds)
    .update({
      deployment_branches: null,
      deployment_environment: null,
      deployment_integration_id: null,
    });

  await db("integrations").whereIn("id", integrationIds).del();
  log.debug("deleted integrations", integrationIds);

  return integrations;
};

export const findIntegration = async (
  id: string,
  { db, logger }: ModelOptions
): Promise<Integration> => {
  const log = logger.prefix("findIntegration");

  const integration = await db
    .select("*")
    .from("integrations")
    .where({ id })
    .first();

  if (!integration) {
    log.error("not found", id);
    throw new Error("Integration not found");
  }

  log.debug("found", id);

  return integration;
};

export const findIntegrationsForTeam = async (
  { github_installation_id, team_id }: FindIntegrationsForTeam,
  { db, logger }: ModelOptions
): Promise<Integration[]> => {
  const log = logger.prefix("findIntegrationsForTeam");
  log.debug(`team ${team_id}`);

  const query = db.select("*").from("integrations").where({ team_id });

  if (!isNil(github_installation_id)) {
    query.andWhere({ github_installation_id });
  }

  const integrations = await query
    .orderBy("github_repo_name", "asc")
    .orderBy("slack_channel", "asc");
  log.debug(`found ${integrations.length} integrations`);

  return integrations;
};
