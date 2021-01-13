export const getShareLink = (): string => {
  const noQueryUrl = window.location.href.split("?")[0];
  // videojs adds an additional div, so need to find video element
  const video = document.querySelector("#video video") as HTMLVideoElement;

  const timestamp = video ? Math.floor(video.currentTime) : null;
  const timestampQuery = timestamp ? `?t=${timestamp}` : "";

  return `${noQueryUrl}${timestampQuery}`;
};
