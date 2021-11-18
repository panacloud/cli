import { Command, flags } from "@oclif/command";
import { startSpinner, stopSpinner } from "../lib/spinner";
const exec = require("await-exec");

export default class Deploy extends Command {
  static description = "Generates CDK code based on the given schema";

  static flags = {
    help: flags.help({ char: "h" }),
    test: flags.boolean({ char: "t" }),
  };

  async run() {
    const { flags } = this.parse(Deploy);

    const spinner = startSpinner("Deploying...");

    await exec(
      "tsc && cdk deploy --require-approval never --outputs-file ./cdk-outputs.json",
      (err: Error, stdout: any) => {
        if (stdout) {
          this.log(stdout);
        }

        if (err) {
          stopSpinner(spinner, `Error: ${err}`, true);
          process.exit(1);
        }
      }
    );

    stopSpinner(spinner, "Deployed", false);
  }
}
