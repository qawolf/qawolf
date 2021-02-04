import { ChangeEvent, KeyboardEvent, useEffect, useRef, useState } from "react";
import { useUpdateEnvironment } from "../../../../hooks/mutations";
import { useOnClickOutside } from "../../../../hooks/onClickOutside";
import { Environment } from "../../../../lib/types";
import { copy } from "../../../../theme/copy";
import TextInput from "../../../shared-new/AppTextInput";

type Props = {
  environment?: Environment;
  onCancel: () => void;
};

export default function EnvironmentName({
  environment,
  onCancel,
}: Props): JSX.Element {
  const ref = useRef<HTMLInputElement>(null);
  const [name, setName] = useState(environment?.name || "");

  const [updateEnvironment] = useUpdateEnvironment();

  // focus input
  useEffect(() => ref.current?.focus(), []);

  const handleChange = (e: ChangeEvent<HTMLInputElement>): void => {
    setName(e.target.value);
  };

  const handleSave = (): void => {
    if (!name) {
      onCancel();
      return;
    }

    if (environment) {
      updateEnvironment({
        optimisticResponse: {
          updateEnvironment: {
            ...environment,
            name,
          },
        },
        variables: { id: environment.id, name },
      }).then(onCancel); // close form after environment is updated
    }
  };

  const handleBlur = (): void => {
    handleSave();
    ref.current?.blur();
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>): void => {
    if (e.key === "Enter") handleBlur();
  };

  useOnClickOutside({ onClickOutside: handleBlur, ref });

  return (
    <TextInput
      onChange={handleChange}
      onKeyDown={handleKeyDown}
      placeholder={copy.environment}
      ref={ref}
      value={name}
    />
  );
}
