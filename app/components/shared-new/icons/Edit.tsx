import { Blank, IconProps } from "grommet-icons";

export default function Edit(props: IconProps): JSX.Element {
  return (
    <Blank {...props} viewBox="0 0 16 16">
      <path
        d="M13.7 5.5C14.1 5.1 14.1 4.5 13.7 4.1L11.9 2.3C11.5 1.9 10.9 1.9 10.5 2.3L2 10.8V14H5.2L13.7 5.5ZM11.2 3L13 4.8L11.5 6.3L9.7 4.5L11.2 3ZM3 13V11.2L9 5.2L10.8 7L4.8 13H3Z"
        fill={props.color}
      />
    </Blank>
  );
}
