import { Command, flags } from "@oclif/command";
import { Input } from "@oclif/parser/lib/args";
import { writeJsonSync, readJsonSync } from "fs-extra";
import { PanacloudconfigFile } from "../utils/constants";
const prettier = require("prettier");

export default class Config extends Command {
  static description = "Upate panacloudconfig.json";

  static args = [{ name: "queryName" }];

  static flags = {
    help: flags.help({ char: "h" }),
    true: flags.boolean({ char: "t" }),
    false: flags.boolean({ char: "f" }),
    all: flags.boolean({ char: "a" }),
  };

  async run() {
    const { flags, args } = this.parse(Config);

    if (!flags.false && !flags.true && !args.queryName && !flags.all) {
      this.log("Please use panacloud config -h to get more about the command");
      process.exit(1);
    }

    const panacloudConfig: PanacloudconfigFile = readJsonSync(
      "editable_src/panacloudconfig.json"
    );
    let keys = Object.keys(panacloudConfig.lambdas);

    if (flags.all) {
      if (flags.true) {
        keys.forEach(
          (v: string) => (panacloudConfig.lambdas[v].is_mock = true)
        );
      } else if (flags.false) {
        keys.forEach(
          (v: string) => (panacloudConfig.lambdas[v].is_mock = false)
        );
      } else {
        this.log("panacloud config -a -t | --true  -f | --false");
      }
    }

    if (args.queryName) {
      if (!keys.includes(args.queryName)) {
        this.log(`${args.queryName} not found`);
        process.exit(1);
      }

      if (flags.true) {
        panacloudConfig.lambdas[args.queryName].is_mock = true;
      } else if (flags.false) {
        panacloudConfig.lambdas[args.queryName].is_mock = false;
      } else {
        this.log("panacloud config query_name -t | --true  -f | --false");
      }
    }

    // const formattedConfigFile = prettier.format(panacloudConfig, {
    //   parser: ".json",
    // });
    writeJsonSync("editable_src/panacloudconfig.json", panacloudConfig);
  }
}
