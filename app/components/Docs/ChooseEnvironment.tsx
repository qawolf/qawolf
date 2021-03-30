import Link from "next/link";

import Image from "./Image";
import SubHeader from "./SubHeader";

export default function ChooseEnvironment(): JSX.Element {
  return (
    <>
      <SubHeader>Choose Environment</SubHeader>
      <p>
        If you have created any{" "}
        <Link href="use-environment-variables">environments</Link>, choose the
        one to use when your tests run.
      </p>
      <Image
        alt="Choose environment"
        height={161}
        src="/docs/run-tests-on-vercel-deployment/choose-environment.png"
        width={489}
      />
      <p>Press the "Create trigger" button to save your new trigger. 🎉</p>
    </>
  );
}
