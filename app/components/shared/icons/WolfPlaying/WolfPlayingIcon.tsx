import { getWolfColors } from "../../../../theme/wolf";

type Props = {
  className?: string;
  color: string;
};

export default function WolfSittingIcon({
  className,
  color,
}: Props): JSX.Element {
  const {
    back,
    ear,
    earShadow,
    eyebrow,
    front,
    line,
    shadow,
    sparkle,
  } = getWolfColors(color);
}
