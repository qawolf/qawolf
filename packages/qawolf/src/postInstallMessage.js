const { bold } = require("kleur");

setTimeout(() => {
  // setTimeout so it logs after everything else, hopefully
  console.log(bold().blue("🐺  QA Wolf successfully installed!"));

  console.log(
    bold().blue("✨  Create your first test by running:"),
    "npx qawolf create <url> [name]\n"
  );
}, 0);
