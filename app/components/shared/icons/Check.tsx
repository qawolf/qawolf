import { Blank, IconProps } from "grommet-icons";

export default function Check(props: IconProps): JSX.Element {
  return (
    <Blank {...props} viewBox="0 0 16 16">
      <path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M11.9697 4.46967L13.0304 5.53033L6.50006 12.0607L2.96973 8.53033L4.03039 7.46967L6.50006 9.93934L11.9697 4.46967Z"
        fill={props.color}
      />
    </Blank>
  );
}
