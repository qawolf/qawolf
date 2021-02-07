import { Box, Keyboard, ThemeContext } from "grommet";
import { ChangeEvent, useContext, useState } from "react";
import { copy } from "../../theme/copy";

import { theme } from "../../theme/theme-new";
import Modal from "../shared-new/Modal";
import Header from "../shared-new/Modal/Header";
import Buttons from "../shared-new/Modal/Buttons";
import TextInput from "../shared-new/AppTextInput";
import { isValidURL } from "../../lib/helpers";
import { useCreateTest } from "../../hooks/mutations";
import { StateContext } from "../StateContext";
import { useRouter } from "next/router";
import { routes } from "../../lib/routes";
import { state } from "../../lib/state";

type Props = { closeModal: () => void };

export default function CreateTest({ closeModal }: Props): JSX.Element {
  const { push } = useRouter();
  const { groupId } = useContext(StateContext);

  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [url, setUrl] = useState("");

  const [createTest] = useCreateTest();

  const handleChange = (e: ChangeEvent<HTMLInputElement>): void => {
    setUrl(e.target.value);
  };

  const handleError = (error: string): void => {
    setError(error);
    setIsLoading(false);
  };

  const handleCreate = (): void => {
    setIsLoading(true);

    if (!url) {
      handleError(copy.required);
      return;
    }

    if (!isValidURL(url)) {
      handleError(copy.invalidUrl);
      return;
    }

    createTest({
      variables: { group_id: groupId, url },
    }).then(
      ({ data }) => {
        if (!data?.createTest) return;
        const { code, id, version } = data.createTest;

        state.setPendingRun({
          code,
          env: {},
          restart: true,
          test_id: id,
          version,
        });

        closeModal();

        const params = url.includes("localhost") ? "?local=1" : "";
        push(`${routes.test}/${id}${params}`);
      },
      () => {
        setError(copy.somethingWrong);
        setIsLoading(false);
      }
    );
  };

  return (
    <ThemeContext.Extend value={theme}>
      <Modal closeModal={closeModal}>
        <Box pad="medium">
          <Header closeModal={closeModal} label={copy.enterUrl} />
          <Keyboard onEnter={handleCreate}>
            <TextInput
              autoFocus
              error={error}
              margin={{ top: "medium" }}
              onChange={handleChange}
              placeholder={copy.urlPlaceholder}
              value={url}
            />
          </Keyboard>
          <Buttons
            onPrimaryClick={handleCreate}
            onSecondaryClick={closeModal}
            primaryIsDisabled={isLoading}
            primaryLabel={copy.createTest}
            secondaryLabel={copy.cancel}
          />
        </Box>
      </Modal>
    </ThemeContext.Extend>
  );
}
