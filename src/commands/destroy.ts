import { Command, flags } from "@oclif/command";
import {
  writeJsonSync,
  readFileSync,
  writeFileSync,
  removeSync,
} from "fs-extra";
import { startSpinner, stopSpinner } from "../lib/spinner";
import chalk = require("chalk");

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

    await exec("cdk destroy --force", (err: Error, stdout: any,stderr:any) => {

      if (err) {
        stopSpinner(spinner, ``, true);
        this.log(chalk.redBright(stdout))
        this.log(chalk.redBright(stderr))
        process.exit(1);
      }
      this.log(stdout)
      removeSync("cdk.out");
      const apiName = JSON.parse(readFileSync("./codegenconfig.json").toString()).api.apiName
      writeFileSync(
        "./cdk-outputs.json",
        `{
        "${apiName}Stack" : {
         
        }
      }`
      );
      stopSpinner(spinner, "Destroyed", false);
    });

    
  }
}
