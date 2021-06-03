import cuid from "cuid";

import { buildColor } from "../../shared/buildColor";
import { ClientError } from "../errors";
import { ModelOptions, Tag, TagsForTest } from "../types";

type CreateTag = {
  name: string;
  team_id: string;
};

type FindTagIdsForNames = {
  names: string;
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
      name: name.trim(),
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

export const findTagIdsForNames = async (
  { names, team_id }: FindTagIdsForNames,
  { db, logger }: ModelOptions
): Promise<string[]> => {
  const log = logger.prefix("findTagIdsForNames");
  log.debug("team", team_id, "names", names);
  // split on commas and remove whitespaces
  const tagNames = names.split(",").map((n) => n.trim());

  const tags = await db("tags")
    .whereIn("name", tagNames)
    .andWhere({ team_id })
    .orderBy("name", "asc");

  const missingTagName = tagNames.find(
    (n) => !tags.some((tag) => tag.name === n)
  );
  if (missingTagName) {
    log.error("not found", missingTagName);
    throw new Error(`Tag ${missingTagName} not found`);
  }

  log.debug(`found ${tags.length} tags`);

  return tags.map((tag) => tag.id);
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

export const findTagsForTests = async (
  test_ids: string[],
  { db, logger }: ModelOptions
): Promise<TagsForTest[]> => {
  const log = logger.prefix("findTagsForTests");
  log.debug("tests", test_ids);

  const tags = await db("tags")
    .select("tags.*")
    .select("tag_tests.test_id")
    .innerJoin("tag_tests", "tags.id", "tag_tests.tag_id")
    .whereIn("tag_tests.test_id", test_ids)
    .orderBy("tags.name", "asc");

  const result: TagsForTest[] = test_ids.map((test_id) => {
    return { tags: [], test_id };
  });

  tags.forEach((t) => {
    result.find((r) => r.test_id === t.test_id)?.tags.push(t);
  });

  return result;
};

export const findTagsForTrigger = async (
  trigger_id: string,
  { db, logger }: ModelOptions
): Promise<Tag[]> => {
  const log = logger.prefix("findTagsForTrigger");
  log.debug("trigger", trigger_id);

  const tags = await db
    .select("tags.*" as "*")
    .from("tags")
    .innerJoin("tag_triggers", "tags.id", "tag_triggers.tag_id")
    .where({ "tag_triggers.trigger_id": trigger_id })
    .orderBy("tags.name", "asc");

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
      throw new ClientError("tag name must be unique");
    }

    throw error;
  }
};
