import { Command, flags } from "@oclif/command";
import {
  readJsonSync,
  writeJsonSync,
  copy,
  readFileSync,
  writeFileSync,
} from "fs-extra";
import { isEqual } from "lodash";
import { error, success } from "log-symbols";
import { greenBright, red } from "chalk";
const prettier = require("prettier");

export default class Config extends Command {
  static description = "describe the command here";

  static flags = {
    help: flags.help({ char: "h" }),
  };

  isPanacloudConfigChanged(fileOneJson: JSON, fileTwoJson: JSON): boolean {
    if (!isEqual(fileOneJson, fileTwoJson)) {
      return false;
    } else {
      return true;
    }
  }

  isNewStageAdded(
    fileOnestages: string[], // User
    fileTwoStage: string[] // hidder folder
  ): {
    isNewStageAdded: boolean;
    newStages?: string[];
  } {
    let isNewStageAdded = true;
    let newStages: string[] = [];
    if (isEqual(fileOnestages, fileTwoStage)) {
      isNewStageAdded = true;
    } else {
      let compare = fileOnestages.filter(function (v) {
        return !fileTwoStage.includes(v);
      });
      isNewStageAdded = false;
      newStages = [...compare];
    }

    return {
      isNewStageAdded,
      newStages,
    };
  }

  async run() {
    const fileOneJson = readJsonSync("editable_src/panacloudconfig.json");
    const fileTwoJson = readJsonSync(
      ".panacloud/editable_src/panacloudconfig.json"
    );

    const isConfigChanged = this.isPanacloudConfigChanged(
      fileOneJson,
      fileTwoJson
    );
    const isStagesAdded = this.isNewStageAdded(
      fileOneJson?.stages,
      fileTwoJson?.stages
    );

    if (isConfigChanged) {
      this.log(`${error} ${red("Panacloud Config is unchanged.")}`);
    }
    if (isStagesAdded.isNewStageAdded) {
      this.log(`${error} ${red("No New Stage is added.")}`);
    }

    if (!isConfigChanged && !isStagesAdded.isNewStageAdded) {
      const stackPackageJson = readJsonSync(`package.json`);
      isStagesAdded.newStages?.forEach((v) => {
        stackPackageJson.scripts[
          `test-${v}`
        ]= `mocha  -r ts-node/register 'tests/**/*.ts' --recursive  --timeout 60000 --exit ${v}`
        stackPackageJson.scripts[
          `deploy-${v}`
        ] = `tsc && STAGE=${v} cdk deploy --outputs-file ./cdk-${v}-outputs.json`;
        stackPackageJson.scripts[
          `destroy-${v}`
        ] = `STAGE=${v} cdk destroy && del-cli --force ./cdk-${v}-outputs.json`;
      });

      writeJsonSync(`./package.json`, stackPackageJson);

      const data = readFileSync("package.json", "utf8");
      const nextData = prettier.format(data, {
        parser: "json",
      });
      writeFileSync("package.json", nextData, "utf8");

      try {
        copy(
          "editable_src/panacloudconfig.json",
          ".panacloud/editable_src/panacloudconfig.json"
        );
      } catch (err) {
        console.error(err);
      }

      this.log(`${success} ${greenBright("New Stages are added.")}`);
    }
  }
}
