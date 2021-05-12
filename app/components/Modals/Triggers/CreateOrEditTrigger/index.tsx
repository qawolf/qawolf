import { Box } from "grommet";
import { useContext } from "react";

import {
  useCreateTrigger,
  useUpdateTrigger,
} from "../../../../hooks/mutations";
import { Trigger, TriggerFields } from "../../../../lib/types";
import { copy } from "../../../../theme/copy";
import Header from "../../../shared/Modal/Header";
import { StateContext } from "../../../StateContext";
import Form from "./Form";

type Props = {
  closeModal: () => void;
  editTrigger: Trigger | null;
  onBack: () => void;
  triggers: Trigger[];
};

export default function CreateOrEditTrigger({
  closeModal,
  editTrigger,
  onBack,
  triggers,
}: Props): JSX.Element {
  const { teamId } = useContext(StateContext);

  const [createTrigger, { loading: createLoading }] = useCreateTrigger();
  const [updateTrigger, { loading: updateLoading }] = useUpdateTrigger();

  const handleSave = (fields: TriggerFields): void => {
    if (editTrigger) {
      updateTrigger({
        optimisticResponse: {
          updateTrigger: { ...editTrigger, ...fields },
        },
        variables: {
          ...fields,
          id: editTrigger.id,
        },
      }).then(onBack);
    } else {
      createTrigger({
        variables: {
          ...fields,
          team_id: teamId,
        },
      }).then(onBack);
    }
  };

  return (
    <Box flex={false}>
      <Header
        closeModal={closeModal}
        label={editTrigger ? copy.editTrigger : copy.createTrigger}
      />
      {!!teamId && (
        <Form
          editTrigger={editTrigger}
          isLoading={createLoading || updateLoading}
          onBack={onBack}
          onSave={handleSave}
          triggers={triggers}
        />
      )}
    </Box>
  );
}
