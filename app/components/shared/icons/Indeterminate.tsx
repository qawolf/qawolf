import { Blank, IconProps } from "grommet-icons";

export default function Indeterminate(props: IconProps): JSX.Element {
  return (
    <Blank {...props} viewBox="0 0 16 16">
      <rect
        x="4"
        y="7.5"
        width="8"
        height="1"
        fill={props.color}
        strokeWidth="1.0"
      />
    </Blank>
  );
}
