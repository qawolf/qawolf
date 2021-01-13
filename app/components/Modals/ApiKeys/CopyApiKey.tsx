import { Box } from "grommet";
import { Checkmark } from "grommet-icons";
import { useEffect, useState } from "react";
import { FaRegClipboard } from "react-icons/fa";

import { ApiKey } from "../../../lib/types";
import { copy } from "../../../theme/copy";
import Button from "../../shared/Button";
import Text from "../../shared/Text";

type Props = {
  apiKey: ApiKey;
  onDoneClick: () => void;
};

const SHOW_MESSAGE_MS = 3000;

export default function CopyApiKey({
  apiKey,
  onDoneClick,
}: Props): JSX.Element {
  const [message, setMessage] = useState("");
  const clearMessage = () => setMessage("");

  // remove copy success/fail message after a few seconds
  useEffect(() => {
    if (!message) return;

    const timeout = setTimeout(clearMessage, SHOW_MESSAGE_MS);
    return () => clearTimeout(timeout);
  }, [message]);

  const handleCopyClick = () => {
    navigator.clipboard.writeText(apiKey.token || "").then(
      () => setMessage(copy.copySuccess),
      () => setMessage(copy.copyFail)
    );
  };

  const CopyIconComponent = message ? null : FaRegClipboard;

  return (
    <Box flex={false}>
      <Text color="red" margin={{ bottom: "small" }} size="small">
        {copy.apiKeyWarning}
      </Text>
      <Box direction="row" justify="between">
        <Box direction="row">
          <Box
            background="lightBlue"
            justify="center"
            margin={{ right: "small" }}
            pad={{ horizontal: "medium" }}
            round="small"
          >
            <Text color="black" isCode size="small">
              {apiKey.token}
            </Text>
          </Box>
          <Button
            IconComponent={CopyIconComponent}
            isSecondary
            message={message || copy.copy}
            onClick={handleCopyClick}
          />
        </Box>
        <Button
          IconComponent={Checkmark}
          message={copy.done}
          onClick={onDoneClick}
        />
      </Box>
    </Box>
  );
}
