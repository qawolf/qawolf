import React from 'react';

function YouTubeVideo({ src }) {
  return (
    <div style={{ height: 0, paddingBottom: '56.25%', position: 'relative' }}>
      <iframe
        allow="accelerometer; autoplay; encrypted-media; gyroscope; picture-in-picture"
        allowFullScreen
        frameBorder="0"
        height="100%"
        src={src}
        style={{ left: 0, position: 'absolute', top: 0 }}
        width="100%"
      ></iframe>
    </div>
  );
}

export default YouTubeVideo;
