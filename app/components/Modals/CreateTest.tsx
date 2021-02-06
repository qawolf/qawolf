import { Box, ThemeContext } from "grommet";
import { ChangeEvent, useState } from "react";
import { copy } from "../../theme/copy";

import { theme } from "../../theme/theme-new";
import Modal from "../shared-new/Modal";
import Header from "../shared-new/Modal/Header";
import TextInput from "../shared-new/AppTextInput";

type Props = { closeModal: () => void };

export default function CreateTest({ closeModal }: Props): JSX.Element {
  const [url, setUrl] = useState("");

  const handleChange = (e: ChangeEvent<HTMLInputElement>): void => {
    setUrl(e.target.value);
  };

  return (
    <ThemeContext.Extend value={theme}>
      <Modal closeModal={closeModal}>
        <Box pad="medium">
          <Header closeModal={closeModal} label={copy.enterUrl} />
          <TextInput
            autoFocus
            margin={{ top: "medium" }}
            onChange={handleChange}
            placeholder={copy.urlPlaceholder}
            value={url}
          />
        </Box>
      </Modal>
    </ThemeContext.Extend>
  );
}
