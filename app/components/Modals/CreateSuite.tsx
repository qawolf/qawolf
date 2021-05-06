import { Box } from "grommet";
import { ChangeEvent, useContext, useEffect, useState } from "react";

import { useCreateSuite } from "../../hooks/mutations";
import { useOnHotKey } from "../../hooks/onHotKey";
import { useEnvironments } from "../../hooks/queries";
import { copy } from "../../theme/copy";
import { edgeSize } from "../../theme/theme";
import Modal from "../shared/Modal";
import Buttons from "../shared/Modal/Buttons";
import Header from "../shared/Modal/Header";
import RadioButtonGroup from "../shared/RadioButtonGroup";
import Text from "../shared/Text";
import { StateContext } from "../StateContext";

type Props = {
  closeModal: () => void;
  testIds: string[];
};

export default function CreateSuite({
  closeModal,
  testIds,
}: Props): JSX.Element {
  const { branch, environmentId, teamId } = useContext(StateContext);
  const [selectedEnvironmentId, setSelectedEnvironmentId] = useState(
    environmentId
  );

  const { data } = useEnvironments({ team_id: teamId }, { environmentId });
  const environments = data?.environments || null;

  const [createSuite, { loading }] = useCreateSuite();

  // do not choose environment if no options
  useEffect(() => {
    if (environments && environments.length < 1) closeModal();
  }, [closeModal, environments]);

  const handleChange = (e: ChangeEvent<HTMLInputElement>): void => {
    setSelectedEnvironmentId(e.target.value);
  };

  const handleClick = (): void => {
    createSuite({
      variables: {
        branch,
        environment_id: selectedEnvironmentId,
        test_ids: testIds,
      },
    }).then(closeModal);
  };

  useOnHotKey({ hotKey: "Enter", onHotKey: handleClick });

  const options = (environments || []).map((e) => {
    return {
      label: e.name,
      value: e.id,
    };
  });

  return (
    <Modal a11yTitle="create suite modal" closeModal={closeModal}>
      <Box pad="medium">
        <Header closeModal={closeModal} label={copy.runTests(testIds.length)} />
        <Text
          color="gray9"
          margin={{ bottom: "medium", top: "xxsmall" }}
          size="componentParagraph"
        >
          {copy.createSuiteDetail}
        </Text>
        <RadioButtonGroup
          direction="column"
          gap={edgeSize.small}
          name={copy.environment}
          options={options}
          onChange={handleChange}
          value={selectedEnvironmentId}
        />
        <Buttons
          onPrimaryClick={handleClick}
          onSecondaryClick={closeModal}
          primaryIsDisabled={loading}
          primaryLabel={copy.runTests(testIds.length)}
          secondaryLabel={copy.cancel}
        />
      </Box>
    </Modal>
  );
}
