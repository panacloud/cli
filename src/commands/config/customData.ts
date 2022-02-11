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

export default class CustomData extends Command {
  static description = "Upate panacloudconfig.json";

  static args = [{ name: "stage_name" }];

  static flags = {
    help: flags.help({ char: "h" }),
    true: flags.boolean({ description: "Set is_custom true" }),
    false: flags.boolean({ description: "Set is_custom false" }),
  };

  async run() {
    const { flags, args } = this.parse(CustomData);
    const spinner = startSpinner("Updating Panacloud Config");

    if (!flags.false && !flags.true) {
      stopSpinner(
        spinner,
        "Please use panacloud config:stage -h to get more info about the command",
        true
      );
      process.exit(1);
    }

    const panacloudConfig: PanacloudconfigFile = readJsonSync(
      "editable_src/panacloudconfig.json"
    );

    if (flags.true) {
      if (panacloudConfig.mockData!["is_custom"]) {
        stopSpinner(spinner, `${args.queryName} already set to true`, true);
        process.exit(1);
      } else {
        panacloudConfig.mockData!["is_custom"] = true;
      }
    } else if (flags.false) {
      if (!panacloudConfig.mockData!["is_custom"]) {
        stopSpinner(spinner, `${args.queryName} already set to false`, true);
        process.exit(1);
      } else {
        panacloudConfig.mockData!["is_custom"] = false;
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
