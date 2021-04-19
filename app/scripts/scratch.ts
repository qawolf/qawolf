import { Octokit, RestEndpointMethodTypes } from "@octokit/rest";
import { connectDb } from "../server/db";
import environment from "../server/environment";
import { Logger } from "../server/Logger";
import { createSyncInstallationAccessToken } from "../server/services/gitHub/app";

(async () => {
  const token = await createSyncInstallationAccessToken(16368781, {
    db: connectDb(),
    logger: new Logger(),
  });
  const octokit = new Octokit({ auth: token });

  const { data } = await octokit.repos.createOrUpdateFileContents({
    owner: "flaurida",
    repo: "test-netlify-plugin",
    path: "qawolf/example.test.js",
    message: "initial QA Wolf commit",
    content: Buffer.from("// this is a comment").toString("base64"),
    committer: { email: "laura@qawolf.com", name: "Laura Cresssman" },
    author: { email: "laura@qawolf.com", name: "Laura Cressman" },
  });

  console.log("DATA", data);
})();
