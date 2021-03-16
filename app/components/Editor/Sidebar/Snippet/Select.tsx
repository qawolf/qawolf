import SharedSelect from "../../../shared/Select";
import Option from "../../../shared/Select/Option";

type Props = {
  onClick: (option: string) => void;
  options: string[];
  value: string;
};

export default function Select({
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
    <SharedSelect direction="up" label={value} type="snippet">
      {optionsHtml}
    </SharedSelect>
  );
}
