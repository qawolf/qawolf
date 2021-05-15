import { Tag } from "../../../../lib/types";
import { copy } from "../../../../theme/copy";
import TagCheckBox from "../../../shared/TagCheckBox";
import Option from "./Option";

type Props = {
  isChecked: boolean;
  onClick: () => void;
  tag?: Tag;
};

const maxWidth = "226px"; // menu width minus padding and checkbox width

export default function TagOption({
  isChecked,
  onClick,
  tag,
}: Props): JSX.Element {
  return (
    <Option a11yTitle={`filter ${tag?.name || copy.noTags}`} onClick={onClick}>
      <TagCheckBox
        pad={{ horizontal: "xsmall", vertical: "xxsmall" }}
        selectState={isChecked ? "all" : "none"}
        tag={tag}
        maxWidth={maxWidth}
        width="full"
      />
    </Option>
  );
}
