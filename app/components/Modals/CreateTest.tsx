import { Box, Keyboard } from "grommet";
import { useRouter } from "next/router";
import { ChangeEvent, useContext, useState } from "react";

import { useCreateTest } from "../../hooks/mutations";
import { isValidURL, parseUrl } from "../../lib/helpers";
import { routes } from "../../lib/routes";
import { state } from "../../lib/state";
import { copy } from "../../theme/copy";
import TextInput from "../shared-new/AppTextInput";
import Modal from "../shared-new/Modal";
import Buttons from "../shared-new/Modal/Buttons";
import Header from "../shared-new/Modal/Header";
import { StateContext } from "../StateContext";

type Props = { closeModal: () => void };

export default function CreateTest({ closeModal }: Props): JSX.Element {
  const { push } = useRouter();
  const { teamId } = useContext(StateContext);

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

    const parsedUrl = parseUrl(url);
    if (!isValidURL(parsedUrl)) {
      handleError(copy.invalidUrl);
      return;
    }

    createTest({
      variables: { team_id: teamId, url: parsedUrl },
    }).then(
      (response) => {
        const { data } = response || {};
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
    <Modal a11yTitle="create test modal" closeModal={closeModal}>
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
  );
}
