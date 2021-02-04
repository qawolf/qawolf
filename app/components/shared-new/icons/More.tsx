import { Blank, IconProps } from "grommet-icons";

export default function More(props: IconProps): JSX.Element {
  return (
    <Blank {...props} viewBox="0 0 16 16">
      <path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M4.25 8C4.25 8.69036 3.69036 9.25 3 9.25C2.30964 9.25 1.75 8.69036 1.75 8C1.75 7.30964 2.30964 6.75 3 6.75C3.69036 6.75 4.25 7.30964 4.25 8ZM9.25 8C9.25 8.69036 8.69036 9.25 8 9.25C7.30964 9.25 6.75 8.69036 6.75 8C6.75 7.30964 7.30964 6.75 8 6.75C8.69036 6.75 9.25 7.30964 9.25 8ZM13 9.25C13.6904 9.25 14.25 8.69036 14.25 8C14.25 7.30964 13.6904 6.75 13 6.75C12.3096 6.75 11.75 7.30964 11.75 8C11.75 8.69036 12.3096 9.25 13 9.25Z"
        fill={props.color}
      />
    </Blank>
  );
}
