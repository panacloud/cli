import { Command, flags } from "@oclif/command";
import chalk = require("chalk");
import { startSpinner, stopSpinner } from "../lib/spinner";
const {exec} = require("child_process");

export default class Deploy extends Command {
  static description = "Generates CDK code based on the given schema";

  static flags = {
    help: flags.help({ char: "h" }),
    test: flags.boolean({ char: "t" }),
  };

  async run() {
    const { flags } = this.parse(Deploy);

    const spinner = startSpinner("Deploying...");

    exec(
      "tsc && cdk deploy --require-approval never --outputs-file ./cdk-outputs.json",
      (err: any, stdout: any,stderr:any) => {
        if (err) {
          stopSpinner(spinner, ``, true);
          this.log(chalk.redBright(stderr))
          this.log(chalk.redBright(stdout))
          process.exit(1);
        }
        this.log(stdout)
        stopSpinner(spinner, "Deployed", false);
    
      }
    );

  }
}
