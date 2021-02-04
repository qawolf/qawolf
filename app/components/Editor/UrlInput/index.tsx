import { Box, Button, TextInput } from "grommet";
import { KeyboardEvent, useContext, useState } from "react";
import { FaArrowRight } from "react-icons/fa";

import { sendPostHogEvent } from "../../../hooks/postHog";
import { DEFAULT_URL, isValidURL, parseUrl } from "../../../lib/helpers";
import { copy } from "../../../theme/copy";
import { colors, lineHeight } from "../../../theme/theme";
import Text from "../../shared/Text";
import { StateContext } from "../../StateContext";
import { RunnerContext } from "../contexts/RunnerContext";
import Instructions from "./Instructions";
import styles from "./UrlInput.module.css";

type Props = {
  onboardUser?: () => void;
  wolfName: string | null;
};

export default function UrlInput({
  onboardUser,
  wolfName,
}: Props): JSX.Element {
  const { groupId } = useContext(StateContext);
  const { createRunTest } = useContext(RunnerContext);

  const [disabled, setDisabled] = useState(false);
  const [error, setError] = useState("");
  const [url, setUrl] = useState("");

  const handleClick = async () => {
    const parsedUrl = parseUrl(url);

    if (!isValidURL(parsedUrl)) {
      setError(copy.invalidUrl);
      return;
    }

    try {
      setDisabled(true);
      setError("");

      sendPostHogEvent("createTest");
      if (onboardUser) onboardUser();

      await createRunTest({
        group_id: groupId || null,
        url: parsedUrl,
      });
    } catch (e) {
      setDisabled(false);
    }
  };

  const handleKeyPress = (e: KeyboardEvent) => {
    if (e.key === "Enter") {
      handleClick();
    }
  };

  return (
    <>
      <Box
        align="center"
        background="brand"
        className={styles.inputContainer}
        direction="row"
        margin={{ top: "-4px" }}
        round="small"
        style={{ zIndex: 11 }}
        width="full"
      >
        <TextInput
          onChange={(e) => setUrl(e.target.value)}
          onKeyPress={handleKeyPress}
          placeholder={DEFAULT_URL}
          plain
          style={{ color: colors.black }}
          value={url}
        />
        <Button
          a11yTitle="create test"
          disabled={disabled}
          onClick={handleClick}
          plain
        >
          <Box
            align="center"
            className={styles.arrow}
            pad={{ vertical: "small" }}
          >
            <FaArrowRight color={colors.navy} size="20px" />
          </Box>
        </Button>
      </Box>
      {!!error && (
        <Text
          color="pink"
          margin={{ bottom: `-${lineHeight.small}` }}
          size="small"
          textAlign="center"
        >
          {error}
        </Text>
      )}
      <Instructions wolfName={wolfName} />
    </>
  );
}
