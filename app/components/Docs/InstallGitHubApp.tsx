import capitalize from "lodash/capitalize";

import Image from "./Image";

type Props = { service: "netlify" | "vercel" };

export default function InstallGitHubApp({ service }: Props): JSX.Element {
  const capitalizedService = capitalize(service);

  return (
    <>
      <p>
        {`Select the "Deployment" tab in the middle, and choose ${capitalizedService} as your
        deploy service. You can also optionally rename your trigger.`}
      </p>
      <Image
        alt="Create deploy trigger"
        height={301}
        src={`/docs/run-tests-on-${service}-deployment/create-deploy-trigger.png`}
        width={483}
      />
      <p>
        Now we'll connect our GitHub repository (repo) to QA Wolf. Click the
        "Connect GitHub repository" button to get started.
      </p>
      <Image
        alt="Connect GitHub repository"
        height={321}
        src={`/docs/run-tests-on-${service}-deployment/github-repo.png`}
        width={400}
      />
      <p>
        A new tab will open and visit GitHub. You will be asked to choose the
        repo(s) you want QA Wolf to access.
      </p>
      <Image
        alt="Install GitHub App"
        height={528}
        src="/docs/run-tests-on-netlify-deployment/install-github-app.png"
        width={400}
      />
      <p>
        Choose the repo(s) you want to test and click the green "Install"
        button. After the installation succeeds, the new tab will close.
      </p>
      <p>Confirm the repo you want to test is now selected in the dropdown.</p>
      <Image
        alt="Choose GitHub repo"
        height={166}
        src={`/docs/run-tests-on-${service}-deployment/choose-repo.png`}
        width={486}
      />
    </>
  );
}
