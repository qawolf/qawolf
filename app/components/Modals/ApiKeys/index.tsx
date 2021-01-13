import { Box } from "grommet";
import { useContext } from "react";

import { useApiKeys } from "../../../hooks/queries";
import { copy } from "../../../theme/copy";
import Layer from "../../shared/Layer";
import Text from "../../shared/Text";
import { StateContext } from "../../StateContext";
import ApiKeysList from "./ApiKeysList";
import CreateApiKey from "./CreateApiKey";

type Props = {
  closeModal: () => void;
};

const WIDTH = "800px";

export default function ApiKeys({ closeModal }: Props): JSX.Element {
  const { teamId } = useContext(StateContext);
  const { data, refetch } = useApiKeys({ team_id: teamId || "" });

  return (
    <Layer onClickOutside={closeModal} onEsc={closeModal}>
      <Box pad="large" width={WIDTH}>
        <Text
          color="black"
          margin={{ bottom: "small" }}
          size="large"
          weight="bold"
        >
          {copy.apiKeys}
        </Text>
        <Text color="gray" size="small">
          {copy.apiKeysDetail}
        </Text>
        <ApiKeysList apiKeys={data?.apiKeys || null} />
        <CreateApiKey refetchApiKeys={refetch} />
      </Box>
    </Layer>
  );
}
