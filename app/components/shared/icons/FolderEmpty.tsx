import { Blank, IconProps } from "grommet-icons";

export default function FolderEmpty(props: IconProps): JSX.Element {
  return (
    <Blank {...props} viewBox="0 0 16 16">
      <path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M12.7071 4H14C14.2652 4 14.5196 4.10536 14.7071 4.29289C14.8946 4.48043 15 4.73478 15 5V13C15 13.2652 14.8946 13.5196 14.7071 13.7071C14.5196 13.8946 14.2652 14 14 14H2.70705L1.70705 15L1 14.2929L14.2929 1L15 1.70705L12.7071 4ZM3.70705 13H14V5H11.7071L3.70705 13Z"
        fill={props.color}
      />
      <path
        d="M5.5858 3H2V12H1V3C1 2.73478 1.10536 2.48043 1.29289 2.29289C1.48043 2.10536 1.73478 2 2 2H5.5858C5.85103 2.00004 6.10539 2.10541 6.29295 2.29295L8 4H9V5H7.5858L5.5858 3Z"
        fill={props.color}
      />
    </Blank>
  );
}
