import { useContext } from "react";

import { useCreateSuite } from "../../../../../hooks/mutations";
import { useEnvironments } from "../../../../../hooks/queries";
import { useTagQuery } from "../../../../../hooks/tagQuery";
import { state } from "../../../../../lib/state";
import { copy } from "../../../../../theme/copy";
import Button from "../../../../shared/AppButton";
import Play from "../../../../shared/icons/Play";
import { StateContext } from "../../../../StateContext";

type Props = { testIds: string[] };

export default function RunTests({ testIds }: Props): JSX.Element {
  const { branch, environmentId, teamId } = useContext(StateContext);
  const { formattedTagNames } = useTagQuery();

  const [createSuite, { loading }] = useCreateSuite();
  const { data, loading: isEnvLoading } = useEnvironments(
    { team_id: teamId },
    { environmentId }
  );

  const environments = data?.environments || [];
  const shouldSelectEnv = environments.length > 1;

  const handleRunClick = (): void => {
    if (!testIds.length) return;

    if (shouldSelectEnv) {
      state.setModal({ name: "createSuite", testIds });
    } else {
      createSuite({
        variables: {
          branch,
          environment_id: environmentId,
          tag_names: formattedTagNames,
          test_ids: testIds,
        },
      });
    }
  };

  return (
    <Button
      IconComponent={Play}
      a11yTitle="run tests"
      isDisabled={isEnvLoading || loading || !testIds.length}
      label={copy.runTests(testIds.length)}
      onClick={handleRunClick}
      type="secondary"
    />
  );
}
