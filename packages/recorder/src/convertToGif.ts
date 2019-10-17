// import { spawn } from "child_process";

// private async saveGif(): Promise<void> {
//   return new Promise(resolve => {
//     // TODO... this._savePath
//     spawn(
//       'ffmpeg -i video.mp4 -vf "fps=10,scale=640:-1:flags=lanczos,setpts=0.25*PTS" -c:v pam -f image2pipe - | convert -delay 10 - -loop 0 -layers optimize video.gif',
//     );
//   });
