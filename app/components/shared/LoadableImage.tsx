import { Image, ImageProps } from "grommet";
import { CSSProperties } from "react";

import { state } from "../../lib/state";
import { ImageGroup } from "../../lib/types";

type Props = ImageProps & {
  callback?: () => void;
  id?: string;
  group: ImageGroup;
  src: string;
  style?: CSSProperties;
  width?: string;
};

export default function LoadableImage({
  callback,
  group,
  ...props
}: Props): JSX.Element {
  const handleLoad = () => {
    state.incrementImageCount(group);
    if (callback) callback();
  };

  return <Image onLoad={handleLoad} {...props} />;
}
