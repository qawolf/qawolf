import { Blank, IconProps } from "grommet-icons";

export default function Trash(props: IconProps): JSX.Element {
  return (
    <Blank {...props} viewBox="0 0 16 16">
      <path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M9 1H7H6V2V3H3H2V4H3V13C3 14.1046 3.89543 15 5 15H11C12.1046 15 13 14.1046 13 13V4H14V3H13H10V2V1H9ZM9 2H7V3H9V2ZM4 4H12V13C12 13.5523 11.5523 14 11 14H5C4.44772 14 4 13.5523 4 13V4ZM6 6H7V12H6V6ZM10 6H9V12H10V6Z"
        fill={props.color}
      />
    </Blank>
  );
}
