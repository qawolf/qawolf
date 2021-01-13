import { useState } from "react";
import { FaRegTrashAlt } from "react-icons/fa";

import { copy } from "../../theme/copy";
import Button from "./Button";

type Props = {
  disabled?: boolean;
  onDelete: () => void;
};

export default function DeleteButton({
  disabled,
  onDelete,
}: Props): JSX.Element {
  const [isConfirm, setIsConfirm] = useState(false);

  const handleClick = () => {
    if (!isConfirm) {
      setIsConfirm(true);
    } else {
      onDelete();
    }
  };

  const IconComponent = isConfirm ? null : FaRegTrashAlt;
  const isSecondary = isConfirm ? false : true;
  const message = isConfirm ? copy.confirm : null;

  return (
    <Button
      IconComponent={IconComponent}
      disabled={disabled}
      isSecondary={isSecondary}
      message={message}
      noBorder={isSecondary}
      onClick={handleClick}
    />
  );
}
