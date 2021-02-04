import { Blank, IconProps } from "grommet-icons";

export default function ArrowLeft(props: IconProps): JSX.Element {
  return (
    <Blank {...props} viewBox="0 0 16 16">
      <path
        d="M10.4956 2.34451L11.1624 3.01102L6.17123 8L11.1624 12.989L10.4956 13.6555L4.83765 8L10.4956 2.34451Z"
        fill={props.color}
      />
    </Blank>
  );
}
