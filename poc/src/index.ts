import main from './main';
import { RunType } from './types/RunType';
const args = process.argv;

if (args.length < 3) {
  handleBadArgs();
  process.exit(1);
} else {
  if (process.argv.indexOf('--help') > -1) {
    generateHelp();
    process.exit(0);
  } else if (process.argv.indexOf('--traffic') > -1) {
    (async () => {
      try {
        await main(RunType.TRAFFIC);
        console.log('Traffic report generated');
        process.exit(0);
      } catch (err) {
        console.error(err);
        process.exit(1);
      }
    })();
  } else if (process.argv.indexOf('--email') > -1) {
    (async () => {
      try {
        await main(RunType.EMAIL);
        console.log('Email report generated');
        process.exit(0);
      } catch (err) {
        console.error(err);
        process.exit(1);
      }
    })();
  } else {
    handleBadArgs();
    process.exit(1);
  }
}

function handleBadArgs() {
  console.log('Bad arguments provided');
  generateHelp();
  process.exit(1);
}

function generateHelp() {
  console.clear();
  console.log('Usage: node index.js [options]');
  console.log('Options:');
  console.log('  --help: Display this message');
  console.log('  --traffic: Generate the traffic report');
  console.log('  --email: Generate the weekly email report');
  process.exit(0);
}
