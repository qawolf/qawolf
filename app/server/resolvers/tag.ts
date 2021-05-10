import {
  createTag,
  deleteTag,
  findTagsForTeam,
  findTagsForTests,
  findTagsForTrigger,
  updateTag,
} from "../models/tag";
import {
  Context,
  CreateTagMutation,
  IdQuery,
  Tag,
  TagsForTest,
  TeamIdQuery,
  TestIdsQuery,
  Trigger,
  UpdateTagMutation,
} from "../types";
import { ensureTagAccess, ensureTeamAccess, ensureTestAccess } from "./utils";

export const createTagResolver = async (
  _: Record<string, unknown>,
  { name, team_id }: CreateTagMutation,
  { db, logger, teams }: Context
): Promise<Tag> => {
  const log = logger.prefix("createTagResolver");
  log.debug("team", team_id);

  ensureTeamAccess({ logger, team_id, teams });

  return createTag({ name, team_id }, { db, logger });
};

export const deleteTagResolver = async (
  _: Record<string, unknown>,
  { id }: IdQuery,
  { db, logger, teams }: Context
): Promise<Tag> => {
  const log = logger.prefix("deleteTagResolver");
  log.debug("tag", id);

  await ensureTagAccess({ tag_id: id, teams }, { db, logger });

  return deleteTag(id, { db, logger });
};

export const tagsResolver = async (
  _: Record<string, unknown>,
  { team_id }: TeamIdQuery,
  { db, logger, teams }: Context
): Promise<Tag[]> => {
  const log = logger.prefix("tagsResolver");
  log.debug("team", team_id);

  ensureTeamAccess({ logger, team_id, teams });

  return findTagsForTeam(team_id, { db, logger });
};

export const tagsForTestsResolver = async (
  _: Record<string, unknown>,
  { test_ids }: TestIdsQuery,
  { db, logger, teams }: Context
): Promise<TagsForTest[]> => {
  const log = logger.prefix("tagsForTestsResolver");
  log.debug("tests", test_ids);

  await Promise.all(
    test_ids.map((test_id) =>
      ensureTestAccess({ teams, test_id }, { db, logger })
    )
  );

  return findTagsForTests(test_ids, { db, logger });
};

export const tagsForTriggerResolver = async (
  { id, team_id }: Trigger,
  _: Record<string, unknown>,
  { db, logger, teams }: Context
): Promise<Tag[]> => {
  const log = logger.prefix("tagsForTriggerResolver");
  log.debug("trigger", id);

  ensureTeamAccess({ logger, team_id, teams });

  return findTagsForTrigger(id, { db, logger });
};

export const updateTagResolver = async (
  _: Record<string, unknown>,
  { id, name }: UpdateTagMutation,
  { db, logger, teams }: Context
): Promise<Tag> => {
  const log = logger.prefix("updateTagResolver");
  log.debug("tag", id);

  await ensureTagAccess({ tag_id: id, teams }, { db, logger });

  return updateTag({ id, name }, { db, logger });
};
