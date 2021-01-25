import { Box } from "grommet";

import { copy } from "../../../theme/copy";
import Layer from "../../shared/Layer";

type Props = {
  closeModal: () => void;
};

const WIDTH = "640px";

export default function EnvVariables({ closeModal }: Props): JSX.Element {
  return (
    <Layer onClickOutside={closeModal} onEsc={closeModal}>
      <Box pad="large" width={WIDTH}>
        <h1>todo</h1>
      </Box>
    </Layer>
  );
}
