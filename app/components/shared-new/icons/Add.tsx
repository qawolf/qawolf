import { Blank, IconProps } from "grommet-icons";

export default function Add(props: IconProps): JSX.Element {
  return (
    <Blank {...props} viewBox="0 0 16 16">
      <path
        d="M8.5 2H7.5V7.5H2V8.5H7.5V14H8.5V8.5H14V7.5H8.5V2Z"
        fill={props.color}
      />
    </Blank>
  );
}
