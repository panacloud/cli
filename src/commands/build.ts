import {Command, flags} from '@oclif/command'
import chalk = require('chalk');
import { startSpinner, stopSpinner } from '../lib/spinner';
const {exec} = require("child_process")

export default class Build extends Command {
  static description = 'describe the command here'

  static flags = {
    help: flags.help({char: 'h'}),
  }


  async run() {
    const spinner = startSpinner("Building ...");

  exec(
      "tsc",
      (err: any, stdout: any, stderr: any) => {
        if (err) {
          stopSpinner(spinner, ``, true);
          this.log(chalk.redBright(stdout));
          process.exit(1)
        }
        stopSpinner(spinner, "Build", false);
        this.log(stdout);
      }
    );

  }
}
