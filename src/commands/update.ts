import { Command, flags } from "@oclif/command";
import { extname } from "path";
import {
  readFileSync,
  writeFileSync,
  removeSync,
  readJsonSync,
  copy,
  writeJsonSync,
  pathExists,
} from "fs-extra";
import * as globby from "globby";
import { isEqual } from "lodash";
import { error, success, info } from "log-symbols";
import { greenBright, red, yellowBright } from "chalk";
import { hide } from "hidefile";
import { startSpinner, stopSpinner } from "../lib/spinner";
import { updateYourOwnApi } from "../lib/api/functions";
import { validateGraphqlSchemaFile } from "../lib/api/errorHandling";
import {
  SAASTYPE,
  Config,
  APITYPE,
  PanacloudconfigFile,
} from "../utils/constants";
import { mkdirRecursiveAsync } from "../lib/fs";
const prettier = require("prettier");
const exec = require("await-exec");

export default class Create extends Command {
  static description = "Updates the Generated Code.";

  static flags = {
    help: flags.help({ char: "h" }),
  };

  isPanacloudConfigChanged(
    fileOneJson: PanacloudconfigFile,
    fileTwoJson: PanacloudconfigFile
  ): [boolean, boolean, boolean] {
    // [PanacloudConfigChanged, ExceptStages, newStages]
    let newStagesAdded = false;
    let panacloudConfigChanged = false;
    let panacloudConfigChangedExceptStages = false;

    if (
      !isEqual(fileOneJson.lambdas, fileTwoJson.lambdas) ||
      !isEqual(fileOneJson.mockLambdaLayer, fileTwoJson.mockLambdaLayer) ||
      !isEqual(fileOneJson.nestedLambdas, fileTwoJson.nestedLambdas) ||
      !isEqual(fileOneJson.stages, fileTwoJson.stages)
    ) {
      panacloudConfigChanged = true;
    }

    if (
      !isEqual(fileOneJson.lambdas, fileTwoJson.lambdas) ||
      !isEqual(fileOneJson.mockLambdaLayer, fileTwoJson.mockLambdaLayer) ||
      !isEqual(fileOneJson.nestedLambdas, fileTwoJson.nestedLambdas)
    ) {
      panacloudConfigChangedExceptStages = true;
    }

    if (!isEqual(fileOneJson.stages, fileTwoJson.stages)) {
      newStagesAdded = true;
    }

    return [
      panacloudConfigChanged,
      panacloudConfigChangedExceptStages,
      newStagesAdded,
    ];
  }

  isSchemaFileChanged(): boolean {
    let result: boolean = false;

    const schemaFile = readFileSync(
      "editable_src/graphql/schema/schema.graphql",
      "utf8"
    )
      .toString()
      .replace(/(\r\n|\n|\r)/gm, "")
      .replace(/\s/g, "");

    const hiddenSchemaFile = readFileSync(
      ".panacloud/editable_src/graphql/schema/schema.graphql",
      "utf8"
    )
      .toString()
      .replace(/(\r\n|\n|\r)/gm, "")
      .replace(/\s/g, "");

    if (schemaFile === hiddenSchemaFile) {
      result = false;
    } else {
      result = true;
    }
    return result;
  }

  updatePackageJson(stages: string[]) {
    const stackPackageJson = readJsonSync(`package.json`);

    let scriptKeys = Object.keys(stackPackageJson.scripts).filter(
      (v) => v.includes("deploy") || v.includes("test") || v.includes("destroy")
    );

    scriptKeys.forEach((v) => delete stackPackageJson.scripts[v]);

    stages?.forEach((v) => {
      stackPackageJson.scripts[
        `test-${v}`
      ] = `mocha  -r ts-node/register 'tests/**/*.ts' --recursive  --timeout 60000 --exit ${v}`;
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
    this.log(`${success} ${greenBright("Stages updated")}`);
  }

  async update() {
    const updatingCode = startSpinner("Updating CDK Code...");

    const configCli: Config = readJsonSync("codegenconfig.json");

    if (configCli.saasType === SAASTYPE.api) {
      if (configCli.api.apiType === APITYPE.graphql) {
        validateGraphqlSchemaFile(
          configCli.api?.schemaPath,
          updatingCode,
          "update"
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
    stopSpinner(setUpForTest, "Test Setup", false);

    const generatingTypes = startSpinner("Generating Types");
    try {
      await exec(`npx graphql-codegen`);
    } catch (error) {
      stopSpinner(generatingTypes, `Error: ${error}`, true);
      process.exit(1);
    }

    stopSpinner(generatingTypes, "Types generated", false);

    const formatting = startSpinner("Formatting Code");
    // Formatting files.
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

    stopSpinner(formatting, "Formatting Done", false);
  }

  async run() {
    const { flags } = this.parse(Create);

    const existsDotPanacloudFolder = await pathExists("./.panacloud");
    const existsEditableSrc = await pathExists("./.panacloud/editable_src");
    const existsPanacloudconfig = await pathExists(
      "./.panacloud/editable_src/panacloudconfig.json"
    );
    const existsSchema = await pathExists(
      "./.panacloud/editable_src/graphql/schema/schema.graphql"
    );

    if (!existsDotPanacloudFolder || !existsEditableSrc) {
      this.log(`${error} ${red(".panacloud folder not found")}`);
      await mkdirRecursiveAsync(`.panacloud`);
      await mkdirRecursiveAsync(`.panacloud/editable_src`);
      await mkdirRecursiveAsync(`.panacloud/editable_src/graphql`);
      await mkdirRecursiveAsync(`.panacloud/editable_src/graphql/schema`);

      hide(".panacloud", (err, newpath) => {
        if (err) {
          console.log(red("Error Occured"));
          process.exit(1);
        }
      });

      try {
        await copy(
          "editable_src/graphql/schema/schema.graphql",
          ".panacloud/editable_src/graphql/schema/schema.graphql"
        );
        await copy(
          "editable_src/panacloudconfig.json",
          ".panacloud/editable_src/panacloudconfig.json"
        );
      } catch (err) {
        console.error(err);
      }

      this.log(`${info} ${yellowBright(".panacloud folder added")}`);
      process.exit(1);
    }

    if (!existsPanacloudconfig) {
      this.log(`${error} ${red("Panacloud Config not found")}`);
      try {
        await copy(
          "editable_src/panacloudconfig.json",
          ".panacloud/editable_src/panacloudconfig.json"
        );
      } catch (err) {
        console.error(err);
      }

      this.log(`${info} ${yellowBright("Panacloud Config added")}`);
      process.exit(1);
    }

    if (!existsSchema) {
      this.log(`${error} ${red("GraphQL Schema not found")}`);
      try {
        await copy(
          "editable_src/graphql/schema/schema.graphql",
          ".panacloud/editable_src/graphql/schema/schema.graphql"
        );
      } catch (err) {
        console.error(err);
      }

      this.log(`${info} ${yellowBright("GraphQL Schema added")}`);
      process.exit(1);
    }

    const pancloudConfigJson: PanacloudconfigFile = readJsonSync(
      "editable_src/panacloudconfig.json"
    );
    const hiddenPanacloudConfig: PanacloudconfigFile = readJsonSync(
      ".panacloud/editable_src/panacloudconfig.json"
    );

    const [isConfigChanged, isConfigChangedExceptStages, isNewStageAdded] =
      this.isPanacloudConfigChanged(pancloudConfigJson, hiddenPanacloudConfig);

    const isSchemaChanged = this.isSchemaFileChanged();

    if (isSchemaChanged) {
      this.log(`${info} ${yellowBright("GraphQL Schema has been updated.")}`);
    } else {
      this.log(`${error} ${red("GraphQL Schema is unchanged.")}`);
    }

    if (isConfigChanged) {
      this.log(`${info} ${yellowBright("Panacloud Config has been updated.")}`);
    } else {
      this.log(`${error} ${red("Panacloud Config is unchanged.")}`);
    }

    if (!isNewStageAdded && isConfigChanged) {
      this.log(`${error} ${red("Stages are not updated")}`);
    }

    if (isNewStageAdded) {
      this.updatePackageJson(pancloudConfigJson?.stages);
    }

    if (isConfigChangedExceptStages || isSchemaChanged) {
      await this.update();
    }

    try {
      await copy(
        "editable_src/graphql/schema/schema.graphql",
        ".panacloud/editable_src/graphql/schema/schema.graphql"
      );
      await copy(
        "editable_src/panacloudconfig.json",
        ".panacloud/editable_src/panacloudconfig.json"
      );
    } catch (err) {
      console.error(err);
    }
  }
}
