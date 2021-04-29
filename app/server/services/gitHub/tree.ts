import { ClientError } from "../../errors";
import { GitHubFile, ModelOptions } from "../../types";
import { createOctokitGraphqlForIntegration } from "./app";

type FindFiles = {
  branch: string;
  integrationId: string;
};

type FindFilesResult = {
  files: GitHubFile[];
  owner: string;
  repo: string;
};

type GitEntry = {
  object?: {
    entries?: GitEntry[];
    oid?: string;
    text?: string;
  };
  path?: string;
};

type RepoFilesData = {
  rateLimit: {
    remaining: number;
  };
  repository: GitEntry;
};

export const GIT_TEST_FILE_EXTENSION = ".test.js";
export const HELPERS_PATH = "qawolf/helpers/index.js";

export const buildHelpersForFiles = (
  files: GitHubFile[],
  { logger }: ModelOptions
): string => {
  const log = logger.prefix("buildHelpersForFiles");

  const helpersFile = files.find((f) => f.path === HELPERS_PATH);
  if (!helpersFile) {
    log.alert("no helpers");
    throw new ClientError(`${HELPERS_PATH} not found`);
  }

  return helpersFile.text;
};

const flattenFiles = (entries: GitEntry[]): GitHubFile[] => {
  const files: GitHubFile[] = [];

  entries.forEach((entry) => {
    if (entry.object?.text !== undefined) {
      files.push({
        path: entry.path,
        sha: entry.object.oid,
        text: entry.object.text,
      });
    } else if (entry.object?.entries) {
      files.push(...flattenFiles(entry.object.entries));
    }
  });

  return files;
};

export const findFilesForBranch = async (
  { branch, integrationId }: FindFiles,
  options: ModelOptions
): Promise<FindFilesResult> => {
  const log = options.logger.prefix("findFilesForBranch");
  log.debug("branch", branch);

  const { graphql, owner, repo } = await createOctokitGraphqlForIntegration(
    integrationId,
    options
  );

  const { rateLimit, repository } = await graphql<RepoFilesData>({
    query: `query repoFiles($owner: String!, $name: String!) {
      rateLimit {
        cost
        remaining
        limit
        used
      }

      repository(owner: $owner, name: $name) {
        object(expression: "${branch}:qawolf/") {
          ... on Tree {
            entries {
              path
              object {
                ... on Blob {
                  oid
                  text
                }
                ... on Tree {
                  entries {
                    path
                    object {
                      ... on Blob {
                        oid
                        text
                      }
                      ... on Tree {
                        entries {
                          path
                          object {
                            ... on Blob {
                              oid
                              text
                            }
                          }
                        }
                      }
                    }
                  }
                }
              }
            }
          }
        }
      }
    }`,
    name: repo,
    owner,
  });

  if (rateLimit.remaining < 100) {
    log.alert(
      `near github api limit integration ${integrationId} ${rateLimit.remaining}`
    );
  }

  if (!repository.object) {
    log.error("branch not found", branch);
    throw new ClientError(`branch not found: ${branch}`);
  }

  const files = flattenFiles(repository.object.entries);

  log.debug(`found ${files.length} files`);

  return { files, owner, repo };
};

export const findTestsForBranch = async (
  parameters: FindFiles,
  options: ModelOptions
): Promise<FindFilesResult> => {
  const log = options.logger.prefix("findTestsForBranch");

  const { files, ...result } = await findFilesForBranch(parameters, options);

  const tests = files.filter(({ path }) =>
    path.includes(GIT_TEST_FILE_EXTENSION)
  );

  log.debug(`found ${tests.length} tests`);

  return { files: tests, ...result };
};
