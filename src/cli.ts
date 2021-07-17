import yargs = require("yargs");
import { red } from 'chalk';

async function main() {
  const argv = await yargs
    .commandDir('cmds')
    .demandCommand()
    .options({
      verbose: {
        alias: 'v',
        describe: 'Verbose mode',
        type: 'boolean',
      },
    })
    .strict()
    .completion()
    .version()
    .help()
    .argv;
}

main().catch((err: Error) => {
  if (!err) {
    return;
  }

  console.error(`[${red('ERROR')}] ${err.message}`);

  if (process.env.DEBUG) {
    console.error();
    console.error(err);
  }

  process.exit(1);
});
