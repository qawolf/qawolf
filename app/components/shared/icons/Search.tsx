import { Blank, IconProps } from "grommet-icons";
import { CSSProperties } from "react";

type Props = IconProps & { style?: CSSProperties };

export default function Search(props: Props): JSX.Element {
  return (
    <Blank {...props} viewBox="0 0 16 16">
      <path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M10.8745 11.5815C9.82911 12.4664 8.47687 13 7 13C3.68629 13 1 10.3137 1 7C1 3.68629 3.68629 1 7 1C10.3137 1 13 3.68629 13 7C13 8.47684 12.4664 9.82905 11.5816 10.8744L15 14.2928L14.293 15L10.8745 11.5815ZM12 7C12 9.76142 9.76142 12 7 12C4.23858 12 2 9.76142 2 7C2 4.23858 4.23858 2 7 2C9.76142 2 12 4.23858 12 7Z"
        fill={props.color}
      />
    </Blank>
  );
}
