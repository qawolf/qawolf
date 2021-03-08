import { Blank, IconProps } from "grommet-icons";

export default function Clock(props: IconProps): JSX.Element {
  return (
    <Blank {...props} viewBox="0 0 16 16">
      <path d="M8 4H7V9H10.5V8H8V4Z" fill={props.color} />
      <path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M15 8C15 11.866 11.866 15 8 15C4.13401 15 1 11.866 1 8C1 4.13401 4.13401 1 8 1C11.866 1 15 4.13401 15 8ZM14 8C14 11.3137 11.3137 14 8 14C4.68629 14 2 11.3137 2 8C2 4.68629 4.68629 2 8 2C11.3137 2 14 4.68629 14 8Z"
        fill={props.color}
      />
    </Blank>
  );
}
