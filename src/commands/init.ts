import { Command, flags } from "@oclif/command";
import { startSpinner, stopSpinner } from "../lib/spinner";
import { basicApi,todoApi,defineYourOwnApi} from "../lib/api/functions";
import { writeFileAsync, mkdirRecursiveAsync } from "../lib/fs";
import { userInput } from "../lib/inquirer";
import {
  checkEmptyDirectoy,
  validateSchemaFile,
} from "../lib/api/errorHandling";
import { TEMPLATE, SAASTYPE } from "../utils/constants";
const path = require("path");
const chalk = require("chalk");
const fs = require("fs");
// const git = require("isomorphic-git");
// const http = require("isomorphic-git/http/node");
const prettier = require("prettier");
const globby = require("globby");
const _ = require("lodash");

export default class Create extends Command {
  static description = "Generates CDK code based on the given schema";

  static flags = {
    help: flags.help({ char: "h" }),
  };

  async run() {
    const { flags } = this.parse(Create);

    // Questions
    let usrInput = await userInput();

    // Config to generate code.
    const config = {
      entityId: usrInput.entityId,
      api_token: usrInput.api_token,
      cloudProvider: usrInput.cloud_provider,
      language: usrInput.language,
      saasType: usrInput.saas_type,
      template: usrInput.template,
      api: {
        apiName: _.camelCase(usrInput.api_name),
        schemaPath: usrInput.schema_path,
        apiType: usrInput.api_type,
        lambdaStyle: usrInput.lambda,
        database: usrInput.database,
      },
    };

    // Error handling
    const validating = startSpinner("Validating Everything");

    if (config.saasType === SAASTYPE.api) {
      checkEmptyDirectoy(validating);
      if (config.template === TEMPLATE.defineApi) {
        validateSchemaFile(
          config.api.schemaPath,
          validating,
          config.api.apiType
        );
      }
    );

    // const dir = path.join(process.cwd(), ".panacloud");

    // // Cloning Codegenerator repo
    // await git.clone({
    //   fs,
    //   http,
    //   dir,
    //   url: "https://github.com/panacloud/cloud-api-template",
    //   singleBranch: true,
    //   ref: "main",
    // });

    // // Installing Packages
    // try {
    //   await exec("cd .panacloud && npm install");
    // } catch (error) {
    //   stopSpinner(initializingCodegen, `Error: ${error.message}`, true);
    //   this.exit(1);
    // }

    stopSpinner(validating, "Everything's fine", false);

    if (config?.template === TEMPLATE.todoApi) {
      await todoApi(config);
    } else if (config.template === TEMPLATE.defineApi) {
      await defineYourOwnApi(config);
    } else {
      await basicApi(config);
    }

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
      ],
      {
        gitignore: true,
      }
    );
    files.forEach(async (file: any) => {
      const data = fs.readFileSync(file, "utf8");
      const nextData = prettier.format(data, {
        parser: path.extname(file) === ".json" ? "json" : "typescript",
      });
      await fs.writeFileSync(file, nextData, "utf8");
    });

    this.log(chalk.greenBright("Build your Billion Dollar API"));
  }
}
