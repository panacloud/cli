import {Command, flags} from '@oclif/command'
import { startSpinner, stopSpinner } from '../lib/spinner';
const  {exec } = require("child_process");

export default class Test extends Command {
  static description = 'describe the command here'

  static flags = {
    help: flags.help({char: 'h'}),
  }

  async run() {
    const spinner = startSpinner("Running Tests ....");
    exec("./node_modules/mocha/bin/mocha  -r ts-node/register 'tests/**/*.ts' --recursive  --timeout 60000 --exit --colors",(err: any, stdout: any, stderr: any) => {
      if (err) {
        stopSpinner(spinner, `${stderr}`, true);
        this.log(stdout);
        process.exit(1)
      }
      stopSpinner(spinner, `Tested`, false);
      this.log(stdout);
    })
  }
}
