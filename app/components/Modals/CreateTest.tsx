import { Box, Keyboard } from "grommet";
import { useRouter } from "next/router";
import { ChangeEvent, useContext, useState } from "react";

import { CreateTestData, useCreateTest } from "../../hooks/mutations";
import { isValidURL, parseUrl } from "../../lib/helpers";
import { routes } from "../../lib/routes";
import { copy } from "../../theme/copy";
import TextInput from "../shared/AppTextInput";
import Modal from "../shared/Modal";
import Buttons from "../shared/Modal/Buttons";
import Header from "../shared/Modal/Header";
import { StateContext } from "../StateContext";

type Props = { closeModal: () => void };

export default function CreateTest({ closeModal }: Props): JSX.Element {
  const { push } = useRouter();
  const { branch, teamId } = useContext(StateContext);

  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [url, setUrl] = useState("");

  const [createTest] = useCreateTest(({ createTest }: CreateTestData): void => {
    closeModal();

    const params = url.includes("localhost") ? "?local=1" : "";
    push(`${routes.test}/${createTest.id}${params}`);
  });

  const handleChange = (e: ChangeEvent<HTMLInputElement>): void => {
    setUrl(e.target.value);
  };

  const handleError = (error: string): void => {
    setError(error);
    setIsLoading(false);
  };

  const handleCreate = (): void => {
    if (isLoading) return;
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
      variables: {
        branch,
        team_id: teamId,
        url: parsedUrl,
      },
    }).catch(() => {
      setError(copy.somethingWrong);
      setIsLoading(false);
    });
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
