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

export default class Stage extends Command {
  static description = "Upate panacloudconfig.json";

  static args = [{ name: "stage_name" }];

  static flags = {
    help: flags.help({ char: "h" }),
    add: flags.boolean({ description: "Add New Stage" }),
    remove: flags.boolean({ description: "Remove Stage" }),
  };

  async run() {
    const { flags, args } = this.parse(Stage);
    const spinner = startSpinner("Updating Panacloud Config");

    if (
      (!args.stage_name && !flags.add && !flags.remove) ||
      (args.stage_name && !flags.add && !flags.remove)
    ) {
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

    if (flags.add) {
      if (panacloudConfig.stages.includes(args.stage_name)) {
        stopSpinner(spinner, `${args.stage_name} stage already exists!`, true);
        process.exit(1);
      } else {
        panacloudConfig.stages = [...panacloudConfig.stages, args.stage_name];
      }
    }
    if (flags.remove) {
      if (!panacloudConfig.stages.includes(args.stage_name)) {
        stopSpinner(spinner, `${args.stage_name} stage does not exist!`, true);
        process.exit(1);
      } else {
        panacloudConfig.stages = panacloudConfig.stages.filter(
          (stage: string) => stage !== args.stage_name
        );
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
