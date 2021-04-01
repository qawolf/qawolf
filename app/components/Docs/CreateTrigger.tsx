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
        You can manage triggers from the dashboard or from the test editor. The
        button to open the triggers popup is in the top right corner of the test
        editor and in the sidebar of the{" "}
        <ExternalLink href="https://www.qawolf.com/tests">
          dashboard
        </ExternalLink>
        .
      </p>
      <Image
        alt="Add trigger from test editor"
        height={221}
        src="/docs/run-tests-on-a-schedule/add-trigger.png"
        width={1600}
      />
      <Image
        alt="Add trigger from dashboard"
        height={353}
        src="/docs/run-tests-on-a-schedule/add-trigger-dashboard.png"
        width={1600}
      />
      <p>
        When tests are selected in the dashboard, the edit triggers button also
        appears in the top row.
      </p>
      <Image
        alt="Add trigger from dashboard with tests selected"
        height={353}
        src="/docs/run-tests-on-a-schedule/add-trigger-dashboard-selected.png"
        width={1600}
      />
      <p>Click this button to open a popup with options to create a trigger.</p>
    </>
  );
}
