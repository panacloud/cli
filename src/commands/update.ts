import { Command, flags } from "@oclif/command";
import { extname } from "path";
import {
  readFileSync,
  writeFileSync,
  removeSync,
  readJsonSync,
  copy,
} from "fs-extra";
import * as globby from "globby";
import { startSpinner, stopSpinner } from "../lib/spinner";
import { updateYourOwnApi } from "../lib/api/functions";
import { validateSchemaFile } from "../lib/api/errorHandling";
import { SAASTYPE, Config, APITYPE } from "../utils/constants";
const prettier = require("prettier");
const exec = require("await-exec");
const chalk = require("chalk");
const fs = require("fs");

export default class Create extends Command {
  static description = "Updates the Generated Code.";

  static flags = {
    help: flags.help({ char: "h" }),
  };

  async run() {
    const { flags } = this.parse(Create);
    let [schemaChanged, panacloudConfigChanged] = this.isChanged();

    if (schemaChanged) {
      this.log(chalk.red("GraphQL Schema has been updated."));
    } else {
      this.log(chalk.greenBright("GraphQL Schema is unchanged."));
    }

    if (panacloudConfigChanged) {
      this.log(chalk.red("Panacloud Config has been updated."));
    } else {
      this.log(chalk.greenBright("Panacloud Config is unchanged."));
    }

    if (schemaChanged || panacloudConfigChanged) {
      await this.update();
    } else {
      this.log(
        chalk.red(
          "GraphQL Schema and Panacloud Config have not changed, therefore no need to Regenerate and Update Code"
        )
      );
    }
  }

  isChanged(): [boolean, boolean] {
    let schemaChanged: boolean = this.isFileChanged(
      "editable_src/graphql/schema/schema.graphql",
      ".panacloud/editable_src/graphql/schema/schema.graphql"
    );

    let panacloudConfigChanged: boolean = this.isFileChanged(
      "editable_src/panacloudconfig.json",
      ".panacloud/editable_src/panacloudconfig.json"
    );
    return [schemaChanged, panacloudConfigChanged];
  }

  isFileChanged(file1: string, file2: string): boolean {
    let result: boolean = false;

    const file1Data = fs
      .readFileSync(file1)
      .toString()
      .replace(/(\r\n|\n|\r)/gm, "")
      .replace(/\s/g, "");
    const file2Data = fs
      .readFileSync(file2)
      .toString()
      .replace(/(\r\n|\n|\r)/gm, "")
      .replace(/\s/g, "");
    if (file1Data === file2Data) {
      result = false;
    } else {
      result = true;
    }
    return result;
  }

  async update() {
    // const validating = startSpinner("Validating Everything");
    const updatingCode = startSpinner("Updating CDK Code...");

    const configCli: Config = readJsonSync("codegenconfig.json");

    if (configCli.saasType === SAASTYPE.api) {
      if (configCli.api.apiType === APITYPE.graphql) {
        validateSchemaFile(
          configCli.api?.schemaPath,
          updatingCode,
          configCli.api?.apiType
        );
      } else {
        stopSpinner(
          updatingCode,
          "Update command is only supported for GraphQL",
          true
        );
        process.exit(1);
      }
    }

    removeSync("mock_lambda");
    removeSync("mock_lambda_layer/mockData");
    removeSync("consumer_lambda");
    removeSync("lib");
    removeSync("tests/apiTests");

    if (configCli.saasType === SAASTYPE.api) {
      await updateYourOwnApi(configCli, updatingCode);
    }

    stopSpinner(updatingCode, "CDK Code Updated", false);
    const setUpForTest = startSpinner("Setup For Test");
    try {
      await exec(
        `npx gqlg --schemaFilePath ./editable_src/graphql/schema/schema.graphql --destDirPath ./tests/apiTests/graphql/`
      );
    } catch (error) {
      stopSpinner(setUpForTest, `Error: ${error}`, true);
      process.exit(1);
    }
    stopSpinner(setUpForTest, "Generating Types", false);

    const generatingTypes = startSpinner("Generating Types");
    try {
      await exec(`npx graphql-codegen`);
    } catch (error) {
      stopSpinner(generatingTypes, `Error: ${error}`, true);
      process.exit(1);
    }

    stopSpinner(generatingTypes, "Types generated", false);

    const formatting = startSpinner("Formatting Code");
    // // Formatting files.
    const files = await globby(
      [
        "*",
        "**/*.ts",
        "!*.gql",
        "!*.graphql",
        "!?.",
        "!*.md",
        "!*.lock",
        "!*.yaml",
        "!*.yml",
        "editable_src/panacloudconfig.json",
        ".panacloud/editable_src/panacloudconfig.json",
      ],
      {
        gitignore: true,
      }
    );

    files.forEach(async (file: any) => {
      const data = readFileSync(file, "utf8");
      const nextData = prettier.format(data, {
        parser: extname(file) === ".json" ? "json" : "typescript",
      });
      writeFileSync(file, nextData, "utf8");
    });

    try {
      copy(
        "editable_src/graphql/schema/schema.graphql",
        ".panacloud/editable_src/graphql/schema/schema.graphql"
      );
      copy(
        "editable_src/panacloudconfig.json",
        ".panacloud/editable_src/panacloudconfig.json"
      );
    } catch (err) {
      console.error(err);
    }

    stopSpinner(formatting, "Formatting Done", false);
  }
}
