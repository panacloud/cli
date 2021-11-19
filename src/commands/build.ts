import {Command, flags} from '@oclif/command'
import { startSpinner, stopSpinner } from '../lib/spinner';
const exec = require("await-exec")

export default class Build extends Command {
  static description = 'describe the command here'

  static flags = {
    help: flags.help({char: 'h'}),
  }


  async run() {
    const spinner = startSpinner("Building ...");

   await exec(
      "tsc",
      (err:any, stdout: any) => {
        if (stdout) {
          this.log(stdout);
        }

        if (err) {
          stopSpinner(spinner, `Error: ${err}`, true);
          process.exit(1);
        }
      }
    );

    stopSpinner(spinner, "Build", false);
  }
}
