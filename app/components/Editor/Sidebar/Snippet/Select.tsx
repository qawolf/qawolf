import SharedSelect from "../../../shared/Select";
import Option from "../../../shared/Select/Option";

type Props = {
  isDisabled?: boolean;
  onClick: (option: string) => void;
  options: string[];
  value: string;
};

export default function Select({
  isDisabled,
  onClick,
  options,
  value,
}: Props): JSX.Element {
  const optionsHtml = options.map((o) => {
    return (
      <Option
        isSelected={o === value}
        key={o}
        label={o}
        onClick={() => onClick(o)}
      />
    );
  });

  return (
    <SharedSelect
      isDisabled={isDisabled}
      direction="up"
      label={value}
      stretch="align"
      type="snippet"
    >
      {optionsHtml}
    </SharedSelect>
  );
}
