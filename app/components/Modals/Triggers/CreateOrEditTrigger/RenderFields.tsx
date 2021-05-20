import { ChangeEvent } from "react";

import { copy } from "../../../../theme/copy";
import TextInput from "../../../shared/AppTextInput";
import Text from "../../../shared/Text";
import { labelTextProps } from "../helpers";

type Props = {
  deployPreviewUrl: string | null;
  hasError: boolean;
  setDeployPreviewUrl: (deployPreviewUrl: string | null) => void;
};

const placeholder = "https://render-example-pr-123.onrender.com";

export default function RenderFields({
  deployPreviewUrl,
  hasError,
  setDeployPreviewUrl,
}: Props): JSX.Element {
  const handleChange = (e: ChangeEvent<HTMLInputElement>): void => {
    setDeployPreviewUrl(e.target.value);
  };

  return (
    <>
      <Text {...labelTextProps}>{copy.previewEnvironmentUrl}</Text>
      <TextInput
        error={hasError ? copy.required : null}
        onChange={handleChange}
        placeholder={placeholder}
        value={deployPreviewUrl}
      />
    </>
  );
}
