import { Command, flags } from "@oclif/command";
import {
  writeJsonSync,
  readFileSync,
  writeFileSync,
  removeSync,
} from "fs-extra";
import { greenBright } from "chalk";
import { startSpinner, stopSpinner } from "../lib/spinner";

const prettier = require("prettier");
const exec = require("await-exec");

export default class Destroy extends Command {
  static description = "Generates CDK code based on the given schema";

  static flags = {
    help: flags.help({ char: "h" }),
    test: flags.boolean({ char: "t" }),
  };

  async run() {
    const { flags } = this.parse(Destroy);

    const spinner = startSpinner("Destroying...");

    await exec("cdk destroy --require-approval never", (err: Error, stdout: any) => {
      if (stdout) {
        this.log(stdout);
      }

      if (err) {
        stopSpinner(spinner, `Error: ${err}`, true);
        process.exit(1);
      }
    });

    removeSync("cdk.out");
    removeSync("cdk-outputs.json");

    stopSpinner(spinner, "Destroyed", false);
  }
}
