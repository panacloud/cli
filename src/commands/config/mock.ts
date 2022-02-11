import { Command, flags } from "@oclif/command";
import {
  writeJsonSync,
  readJsonSync,
  readFileSync,
  writeFileSync,
} from "fs-extra";
import { startSpinner, stopSpinner } from "../../lib/spinner";
import { PanacloudconfigFile } from "../../utils/constants";
const prettier = require("prettier");

export default class Mock extends Command {
  static description = "Upate panacloudconfig.json";

  static args = [{ name: "query_name" }];

  static flags = {
    help: flags.help({ char: "h" }),
    true: flags.boolean({ description: "Set is_mock true" }),
    false: flags.boolean({ description: "Set is_mock false" }),
  };

  checkValExists(
    panacloudConfig: PanacloudconfigFile,
    keys: string[],
    query_name: string
  ): boolean {
    let res = false;
    keys.forEach((e) => {
      if (panacloudConfig.lambdas[e].is_mock === undefined) {
        let obj = Object.keys(panacloudConfig.lambdas[e]).filter(
          (v) => v === query_name
        );
        if (obj.length !== 0) res = true;
      }
    });

    return res;
  }

  async run() {
    const { flags, args } = this.parse(Mock);
    const spinner = startSpinner("Updating Panacloud Config");

    if (
      (!args.query_name && !flags.true && !flags.false) ||
      (args.query_name && !flags.true && !flags.false)
    ) {
      stopSpinner(
        spinner,
        "Please use panacloud config:memory -h to get more info about the command",
        true
      );
      process.exit(1);
    }

    const panacloudConfig: PanacloudconfigFile = readJsonSync(
      "editable_src/panacloudconfig.json"
    );

    const keys = Object.keys(panacloudConfig.lambdas);

    if (!keys.includes(args.query_name)) {
      if (!this.checkValExists(panacloudConfig, keys, args.query_name)) {
        stopSpinner(spinner, `${args.query_name} Not Exists`, true);
        process.exit(1);
      }
    }

    if (panacloudConfig.lambdas[args.query_name]?.is_mock === undefined) {
      keys.forEach((e) => {
        if (panacloudConfig.lambdas[e].is_mock === undefined) {
          Object.keys(panacloudConfig.lambdas[e]).forEach((v) => {
            if (v === args.query_name) {
              if (flags.true) {
                if (panacloudConfig.lambdas[e][v].is_mock) {
                  stopSpinner(
                    spinner,
                    `${args.query_name} already set to false`,
                    true
                  );
                  process.exit(1);
                } else {
                  panacloudConfig.lambdas[e][v].is_mock = true;
                }
              } else {
                if (!panacloudConfig.lambdas[e][v].is_mock) {
                  stopSpinner(
                    spinner,
                    `${args.query_name} already set to false`,
                    true
                  );
                  process.exit(1);
                } else {
                  panacloudConfig.lambdas[e][v].is_mock = false;
                }
              }
            }
          });
        }
      });
    } else {
      if (flags.true) {
        if (panacloudConfig.lambdas[args.query_name].is_mock) {
          stopSpinner(spinner, `${args.query_name} already set to true`, true);
          process.exit(1);
        } else {
          panacloudConfig.lambdas[args.query_name].is_mock = true;
        }
      } else {
        if (!panacloudConfig.lambdas[args.query_name].is_mock) {
          stopSpinner(spinner, `${args.query_name} already set to false`, true);
          process.exit(1);
        } else {
          panacloudConfig.lambdas[args.query_name].is_mock = false;
        }
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
