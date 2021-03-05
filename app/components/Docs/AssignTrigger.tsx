import Image from "./Image";

type Props = { doc: string };

export default function AssignTrigger({ doc }: Props): JSX.Element {
  return (
    <>
      <p>
        Now that we've created our trigger, let's assign it to a test. You can
        assign triggers to tests any time by clicking the "Edit triggers" button
        in the top right corner of the editor, or by selecting tests in the
        dashboard.
      </p>
      <p>
        The checkboxes indicate whether a trigger is assigned to the selected
        tests. Clicking on this checkbox will toggle whether the trigger is
        assigned to your test.
      </p>
      <Image
        alt="Edit triggers for test"
        height={247}
        src={`/docs/${doc}/edit-triggers.png`}
        width={488}
      />
      <p>When you are done, click the "Done" button to close the popup.</p>
      <p>
        You can also edit or delete triggers by hovering over them and clicking
        the relevant button.
      </p>
      <Image
        alt="Edit or delete trigger"
        height={247}
        src={`/docs/${doc}/edit-trigger.png`}
        width={491}
      />
    </>
  );
}
