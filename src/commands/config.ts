import { Command, flags } from "@oclif/command";
import {
  writeJsonSync,
  readJsonSync,
  readFileSync,
  writeFileSync,
} from "fs-extra";
import { startSpinner, stopSpinner } from "../lib/spinner";
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
    const spinner = startSpinner("Updating Panacloud Config");

    if (!flags.false && !flags.true && !args.queryName && !flags.all) {
      stopSpinner(
        spinner,
        "Please use panacloud config -h to get more info about the command",
        true
      );
      process.exit(1);
    }

    const panacloudConfig: PanacloudconfigFile = readJsonSync(
      "editable_src/panacloudconfig.json"
    );

    const keys = Object.keys(panacloudConfig.lambdas);

    if (flags.all) {
      if (flags.true) {
        keys.forEach((e) => {
          if (panacloudConfig.lambdas[e].is_mock === undefined) {
            Object.keys(panacloudConfig.lambdas[e]).forEach(
              (v) => (panacloudConfig.lambdas[e][v].is_mock = true)
            );
          } else {
            panacloudConfig.lambdas[e].is_mock = true;
          }
        });
      } else if (flags.false) {
        keys.forEach((e) => {
          if (panacloudConfig.lambdas[e].is_mock === undefined) {
            Object.keys(panacloudConfig.lambdas[e]).forEach(
              (v) => (panacloudConfig.lambdas[e][v].is_mock = false)
            );
          } else {
            panacloudConfig.lambdas[e].is_mock = false;
          }
        });
      } else {
        stopSpinner(
          spinner,
          "panacloud config -a -t | --true  -f | --false",
          true
        );
        process.exit(1);
      }
    }

    if (args.queryName) {
      if (!keys.includes(args.queryName)) {
        this.log(`${args.queryName} not found`);
        stopSpinner(spinner, `${args.queryName} not found`, true);
        process.exit(1);
      }

      if (flags.true) {
        if (panacloudConfig.lambdas[args.queryName].is_mock) {
          stopSpinner(spinner, `${args.queryName} already set to true`, true);
          process.exit(1);
        } else {
          panacloudConfig.lambdas[args.queryName].is_mock = true;
        }
      } else if (flags.false) {
        if (!panacloudConfig.lambdas[args.queryName].is_mock) {
          stopSpinner(spinner, `${args.queryName} already set to false`, true);
          process.exit(1);
        } else {
          panacloudConfig.lambdas[args.queryName].is_mock = false;
        }
      } else {
        stopSpinner(
          spinner,
          "panacloud config query_name -t | --true  -f | --false",
          true
        );
        process.exit(1);
      }
    }

    writeJsonSync("editable_src/panacloudconfig.json", panacloudConfig);

    // Formating Data
    const data = readFileSync("editable_src/panacloudconfig.json", "utf8");
    const formattedConfigFile = prettier.format(data, {
      parser: "json",
    });
    writeFileSync(
      "editable_src/panacloudconfig.json",
      formattedConfigFile,
      "utf8"
    );

    stopSpinner(spinner, "Updated Panacloud Config", false);
  }
}
