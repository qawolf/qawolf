import { Blank, IconProps } from "grommet-icons";

export default function Close(props: IconProps): JSX.Element {
  return (
    <Blank {...props} viewBox="0 0 16 16">
      <path
        d="M13 3.7L12.3 3L8 7.3L3.7 3L3 3.7L7.3 8L3 12.3L3.7 13L8 8.7L12.3 13L13 12.3L8.7 8L13 3.7Z"
        fill={props.color}
      />
    </Blank>
  );
}
