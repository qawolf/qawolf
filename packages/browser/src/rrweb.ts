import { logger } from "@qawolf/logger";
import fs from "fs-extra";
import path from "path";

export const rrwebBundle = fs.readFileSync(
  path.resolve(path.dirname(require.resolve("rrweb")), "../dist/rrweb.min.js"),
  "utf8"
);

export const rrwebCss = fs.readFileSync(
  path.resolve(path.dirname(require.resolve("rrweb")), "../dist/rrweb.min.css"),
  "utf8"
);

export const createHtml = (index: number, events: any[]) => {
  if (!logger.path) return;

  const content = `
<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8" />
<meta name="viewport" content="width=device-width, initial-scale=1.0" />
<meta http-equiv="X-UA-Compatible" content="ie=edge" />
<title>Record</title>
</head>
<body>
<link
  rel="stylesheet"
  href="https://cdn.jsdelivr.net/npm/rrweb-player@latest/dist/style.css"
/>
<script src="https://cdn.jsdelivr.net/npm/rrweb-player@latest/dist/index.js"></script>
<script>
  /*<!--*/
  const events = ${JSON.stringify(events).replace(
    /<\/script>/g,
    "<\\/script>"
  )};

  const replayer = new rrwebPlayer({
    target: document.body,
    data: {
      events,
      autoPlay: true,
    },
  });
</script>
</body>
</html>  
`;

  const savePath = path.join(logger.path, `replay_${index}.html`);
  fs.writeFileSync(savePath, content);
  console.log(`Saved at ${savePath}`);
};
