import Octokit from "@octokit/rest";

const octokit = new Octokit({
  auth: "d9e1b19607b2b07ed5c6f2e78fa5fb1bd3cabf26"
});

const main = async () => {
  const res = await octokit.checks.create({
    owner: "qawolf",
    repo: "internal",
    name: "QA Wolf",
    head_sha: "9c52a7a6f2090c58bcb23ae066ce31920789f71c"
  });

  console.log("RESPONSE", res);
};

main();
