import cuid from "cuid";

import { ClientError } from "../errors";
import { ModelOptions, Tag } from "../types";
import { buildColor } from "./utils";

type CreateTag = {
  name: string;
  team_id: string;
};

type UpdateTag = {
  id: string;
  name: string;
};

const ensureValidName = (name: string): void => {
  if (!name.includes(",")) return;

  throw new Error("cannot include commas in tag name");
};

export const createTag = async (
  { name, team_id }: CreateTag,
  { db, logger }: ModelOptions
): Promise<Tag> => {
  const log = logger.prefix("createTag");
  log.debug(`create ${name} for team ${team_id}`);

  try {
    ensureValidName(name);

    const teamTags = await findTagsForTeam(team_id, { db, logger });

    const tag = {
      color: buildColor(teamTags.map((t) => t.color)),
      id: cuid(),
      name,
      team_id,
    };

    await db("tags").insert(tag);
    log.debug("created", tag.id);

    return tag;
  } catch (error) {
    if (error.message.includes("unique")) {
      throw new ClientError("tag name must be unique");
    }

    throw error;
  }
};

export const deleteTag = async (
  id: string,
  { db, logger }: ModelOptions
): Promise<Tag> => {
  const log = logger.prefix("deleteTag");
  log.debug("tag", id);

  const tag = await findTag(id, { db, logger });
  await db("tags").where({ id }).del();

  log.debug("deleted");

  return tag;
};

export const findTag = async (
  id: string,
  { db, logger }: ModelOptions
): Promise<Tag> => {
  const log = logger.prefix("findTag");
  log.debug("tag", id);

  const tag = await db("tags").where({ id }).first();

  if (!tag) {
    log.error("not found");
    throw new Error("tag not found");
  }

  log.debug("found");
  return tag;
};

export const findTagsForTeam = async (
  team_id: string,
  { db, logger }: ModelOptions
): Promise<Tag[]> => {
  const log = logger.prefix("findTagsForTeam");
  log.debug("team", team_id);

  const tags = await db("tags").where({ team_id }).orderBy("name", "asc");

  log.debug(`found ${tags.length} tags`);

  return tags;
};

export const updateTag = async (
  { id, name }: UpdateTag,
  { db, logger }: ModelOptions
): Promise<Tag> => {
  const log = logger.prefix("updateTag");
  log.debug("tag", id, "name", name);

  try {
    ensureValidName(name);

    const tags = await db("tags")
      .where({ id })
      .update({ name, updated_at: new Date().toISOString() }, "*");
    const tag = tags[0] || null;

    if (!tag) {
      throw new Error("tag not found");
    }

    log.debug("updated");

    return tag;
  } catch (error) {
    log.error(error.message);

    if (error.message.includes("tags_unique_name_team_id")) {
      throw new Error("tag name must be unique");
    }

    throw error;
  }
};
