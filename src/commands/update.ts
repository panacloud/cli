import { Command, flags } from "@oclif/command";
import { extname } from "path";
import {
  readFileSync,
  writeFileSync,
  removeSync,
  readJsonSync,
} from "fs-extra";
import * as globby from "globby";
import { startSpinner, stopSpinner } from "../lib/spinner";
import { updateYourOwnApi } from "../lib/api/functions";
import { validateSchemaFile } from "../lib/api/errorHandling";
import { TEMPLATE, SAASTYPE, Config, APITYPE } from "../utils/constants";
const prettier = require("prettier");
const exec = require("await-exec");

export default class Create extends Command {
  static description = "Updates the Generated Code.";

  static flags = {
    help: flags.help({ char: "h" }),
  };

  async run() {
    const { flags } = this.parse(Create);

    const validating = startSpinner("Validating Everything");

    const configCli: Config = readJsonSync("codegenconfig.json");

    if (configCli.saasType === SAASTYPE.api) {
      if (configCli.api.apiType === APITYPE.graphql) {
        if (configCli.api?.template === TEMPLATE.defineApi) {
          validateSchemaFile(
            configCli.api?.schemaPath,
            validating,
            configCli.api?.apiType
          );
        } else {
          stopSpinner(
            validating,
            "Update command is only supported for 'Define Your Own API'",
            true
          );
          process.exit(1);
        }
      } else {
        stopSpinner(
          validating,
          "Update command is only supported for GraphQL",
          true
        );
        process.exit(1);
      }
    }

    stopSpinner(validating, "Everything's fine", false);

    const updatingCode = startSpinner("Updating CDK Code...");

    removeSync("mock_lambda");
    removeSync("lambdaLayer/mockApi");
    removeSync("consumer_lambda");
    removeSync("lib");
    removeSync("tests/apiTests");

    if (configCli.saasType === SAASTYPE.api) {
      if (configCli.api?.template === TEMPLATE.defineApi) {
        await updateYourOwnApi(configCli, updatingCode);
      }
    }

    stopSpinner(updatingCode, "CDK Code Updated", false);
    const setUpForTest = startSpinner("Setup For Test");
    try {
      exec(
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
      await writeFileSync(file, nextData, "utf8");
    });

    stopSpinner(formatting, "Formatting Done", false);
  }
}
