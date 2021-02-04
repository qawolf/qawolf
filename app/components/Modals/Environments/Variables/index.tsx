import { Box } from "grommet";
import { copy } from "../../../../theme/copy";
import Header from "../../../shared-new/Modal/Header";

type Props = { closeModal: () => void };

export default function Variables({ closeModal }: Props): JSX.Element {
  return (
    <Box
      border={{ color: "gray3", side: "left", size: "xsmall" }}
      pad="medium"
      width="full"
    >
      <Header closeModal={closeModal} label={copy.envVariables} />
    </Box>
  );
}
