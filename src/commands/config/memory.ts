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

export default class Memory extends Command {
  static description = "Upate panacloudconfig.json";

  static args = [{ name: "query_name" }, { name: "memory_size" }];

  static flags = {
    help: flags.help({ char: "h" }),
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
    const { flags, args } = this.parse(Memory);
    const spinner = startSpinner("Updating Panacloud Config");

    if (
      (!args.memory_size && !args.query_name) ||
      (!args.memory_size && args.query_name)
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

    if (args.memory_size <= 0) {
      stopSpinner(spinner, "Invalid Memory Size", true);
      process.exit(1);
    }

    if (panacloudConfig.lambdas[args.query_name]?.is_mock === undefined) {
      keys.forEach((e) => {
        if (panacloudConfig.lambdas[e].is_mock === undefined) {
          Object.keys(panacloudConfig.lambdas[e]).forEach((v) => {
            if (v === args.query_name) {
              panacloudConfig.lambdas[e][v].memory_size = parseInt(
                args.memory_size
              );
            }
          });
        }
      });
    } else {
      panacloudConfig.lambdas[args.query_name].memory_size = parseInt(
        args.memory_size
      );
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
