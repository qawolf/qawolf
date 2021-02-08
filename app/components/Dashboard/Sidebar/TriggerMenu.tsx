import { FaRegTrashAlt } from "react-icons/fa";

import { state } from "../../../lib/state";
import { copy } from "../../../theme/copy";
import Dropdown from "../../shared/Dropdown";
import Option from "../../shared/Dropdown/Option";

type Props = {
  closeMenu: () => void;
  triggerId: string;
  triggerName: string;
};

export default function TriggerMenu({
  closeMenu,
  triggerId,
  triggerName,
}: Props): JSX.Element {
  const handleClick = () => {
    closeMenu();

    state.setModal({
      name: "deleteTrigger",
      trigger: { id: triggerId, name: triggerName },
    });
  };

  return (
    <Dropdown>
      <Option
        IconComponent={FaRegTrashAlt}
        isSelected={false}
        message={copy.deleteGroup}
        onClick={handleClick}
      />
    </Dropdown>
  );
}
