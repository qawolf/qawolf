import { Blank, IconProps } from "grommet-icons";

export default function Configure(props: IconProps): JSX.Element {
  return (
    <Blank {...props} viewBox="0 0 16 16">
      <path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M12.95 4H15V5H12.95C12.7 6.15 11.7 7 10.5 7C9.3 7 8.3 6.15 8.05 5H1V4H8.05C8.3 2.85 9.3 2 10.5 2C11.7 2 12.7 2.85 12.95 4ZM9 4.5C9 5.35 9.65 6 10.5 6C11.35 6 12 5.35 12 4.5C12 3.65 11.35 3 10.5 3C9.65 3 9 3.65 9 4.5ZM3.05 12H1V11H3.05C3.3 9.85 4.3 9 5.5 9C6.7 9 7.7 9.85 7.95 11H15V12H7.95C7.7 13.15 6.7 14 5.5 14C4.3 14 3.3 13.15 3.05 12ZM7 11.5C7 10.65 6.35 10 5.5 10C4.65 10 4 10.65 4 11.5C4 12.35 4.65 13 5.5 13C6.35 13 7 12.35 7 11.5Z"
        fill={props.color}
      />
    </Blank>
  );
}
