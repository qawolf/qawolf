import "video.js/dist/video-js.min.css";

import { useRouter } from "next/router";
import { useCallback, useEffect, useState } from "react";
import videojs, { VideoJsPlayer, VideoJsPlayerOptions } from "video.js";

import { colors } from "../../../theme/theme-new";

type Props = {
  height?: number;
  isMobile?: boolean;
  isVisible: boolean;
  videoUrl?: string;
  width?: number;
};

const videoJsOptions = {
  controlBar: {
    pictureInPictureToggle: false,
    volumePanel: false,
  },
  controls: true,
  playbackRates: [1.0, 2.0, 3.0],
};

export default function TestVideo({
  height,
  isMobile,
  isVisible,
  videoUrl,
  width,
}: Props): JSX.Element {
  const { query } = useRouter();

  const timestamp = query.t ? Number(query.t) : null;

  const [player, setPlayer] = useState<VideoJsPlayer | null>(null);
  // need callback to run after render
  // https://reactjs.org/docs/hooks-faq.html#how-can-i-measure-a-dom-node
  const videoRef = useCallback(
    (node: HTMLVideoElement | null) => {
      if (!node) return;

      const vjsPlayer = videojs(node, {
        ...videoJsOptions,
        fluid: isMobile,
      } as VideoJsPlayerOptions);
      setPlayer(vjsPlayer);

      // prevent blank screen from being preview image
      node.currentTime = timestamp || 1;

      return () => vjsPlayer.dispose();
    },
    [isMobile, timestamp]
  );

  useEffect(() => {
    if (!player || !videoUrl) return;

    player.src({ src: videoUrl });
  }, [player, videoUrl]);

  if (!isVisible || !videoUrl) return null;

  return (
    <div data-vjs-player style={{ background: colors.gray0, height, width }}>
      <video className="video-js" id="video" ref={videoRef} />
    </div>
  );
}
