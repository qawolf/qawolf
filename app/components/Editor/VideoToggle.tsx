import { Chrome, Video } from "grommet-icons";
import { Dispatch, SetStateAction, useEffect } from "react";

import { copy } from "../../theme/copy";
import Toggle from "../shared/Toggle";

const BORDER_SIZE = "4px";

type Props = {
  isBrowserReady: boolean;
  isVideoToggled: boolean;
  toggleVideo: Dispatch<SetStateAction<boolean>>;
  videoUrl?: string;
};

export default function VideoToggle({
  isBrowserReady,
  isVideoToggled,
  toggleVideo,
  videoUrl,
}: Props): JSX.Element {
  useEffect(() => {
    if (isBrowserReady) toggleVideo(false);
  }, [isBrowserReady, toggleVideo]);

  if (!videoUrl || !isBrowserReady) return null;

  const handleClick = () => toggleVideo((prev) => !prev);

  const IconComponent = isVideoToggled ? Video : Chrome;
  const message = isVideoToggled ? copy.showBrowser : copy.showVideo;

  return (
    <Toggle
      IconComponent={IconComponent}
      border={{ color: "borderBlue", size: BORDER_SIZE }}
      isOn={!isVideoToggled}
      margin={{ top: "medium" }}
      message={message}
      onClick={handleClick}
    />
  );
}
