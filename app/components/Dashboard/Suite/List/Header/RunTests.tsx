import { useCreateSuite } from "../../../../../hooks/mutations";
import { Suite, SuiteRun } from "../../../../../lib/types";
import { copy } from "../../../../../theme/copy";
import Button from "../../../../shared/AppButton";
import Play from "../../../../shared/icons/Play";

type Props = {
  runs: SuiteRun[];
  suite: Suite;
  testIds: string[];
};

export default function RunTests({ runs, suite, testIds }: Props): JSX.Element {
  const [createSuite, { loading }] = useCreateSuite();

  const test_ids = testIds.length ? testIds : runs.map((r) => r.test_id);

  const handleClick = (): void => {
    if (!test_ids.length) return;
    createSuite({
      variables: {
        branch: suite.branch,
        environment_id: suite.environment_id,
        environment_variables: suite.environment_variables,
        test_ids,
      },
    });
  };

  return (
    <Button
      IconComponent={Play}
      isDisabled={loading || !test_ids.length}
      label={copy.runTests(test_ids.length)}
      onClick={handleClick}
      type="secondary"
    />
  );
}
