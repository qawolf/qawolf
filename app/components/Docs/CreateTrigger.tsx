import ExternalLink from "./ExternalLink";
import Image from "./Image";

type Props = { description: string };

export default function CreateTrigger({ description }: Props): JSX.Element {
  return (
    <>
      <p>
        {`First we'll create a trigger to run our tests ${description}. QA Wolf uses
        triggers to determine when to run your tests.`}
      </p>
      <p>
        To manage your team's triggers, use the "Triggers" button in the sidebar
        of the{" "}
        <ExternalLink href="https://www.qawolf.com/tests">
          dashboard
        </ExternalLink>
        .
      </p>
      <Image
        alt="Add trigger from dashboard"
        height={328}
        src="/docs/run-tests-on-a-schedule/add-trigger-dashboard.png"
        width={1600}
      />
      <p>Click this button to open a popup with options to create a trigger.</p>
    </>
  );
}
