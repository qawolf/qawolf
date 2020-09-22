const { bold } = require('kleur');

process.on('exit', () => {
  console.log(bold().blue('🐺  QA Wolf successfully installed!'));

  console.log(
    bold().blue('✨  Create your first test by running:'),
    'npx qawolf create\n',
  );
});
