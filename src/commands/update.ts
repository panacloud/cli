import { Command, flags } from "@oclif/command";
import { startSpinner, stopSpinner } from "../lib/spinner";
import { basicApi, todoApi, updateYourOwnApi } from "../lib/api/functions";
import { userInput } from "../lib/inquirer";
import {
  checkEmptyDirectoy,
  validateSchemaFile,
} from "../lib/api/errorHandling";
import { TEMPLATE, SAASTYPE, Config, APITYPE } from "../utils/constants";
const path = require("path");
const chalk = require("chalk");
const fs = require("fs");
const prettier = require("prettier");
const globby = require("globby");
const exec = require("await-exec");
const camelCase = require("lodash/camelCase");

import { PanacloudconfigFile } from "../utils/constants";

export default class Create extends Command {
  static description = "Generates CDK code based on the given schema";

  static flags = {
    help: flags.help({ char: "h" }),
  };

  async run() {
    const { flags } = this.parse(Create);

    let templateDir;


   const validating = startSpinner("Validating files");

     let cliConfigRawData = fs.readFileSync('codegenconfig.json', (err: string) => {
      if (err) {
        stopSpinner(validating, `Error: ${err}`, true);
        process.exit(1);
      }
    });

    let config:Config = JSON.parse(cliConfigRawData);

    if (config.saasType === SAASTYPE.api) {
      templateDir = path.resolve(__dirname, "../lib/api/template");
      if (config.api.apiType === APITYPE.graphql){
      if (config.api?.template === TEMPLATE.defineApi) {
        validateSchemaFile(
          config.api?.schemaPath,
          validating,
          config.api?.apiType
        );
      }

      else {
        stopSpinner(validating, "Update command is only supported for 'defining your own API'", false);
        process.exit(1);
      }
    }

      else {
        stopSpinner(validating, "Update command is only supported for GraphQl", false);
        process.exit(1);
      }
    }

    stopSpinner(validating, "Files validated", false);


    const updatingCode = startSpinner("Updating Code");


    fs.rmdirSync('lambda', { recursive: true });
    fs.rmdirSync('lib', { recursive: true });

    const panacloudConfigRawData = fs.readFileSync('custom_src/panacloudConfig.json', (err: string) => {
      if (err) {
        stopSpinner(updatingCode, `Error: ${err}`, true);
        process.exit(1);
      }
    });
    
    let panacloudConfig:PanacloudconfigFile = JSON.parse(panacloudConfigRawData);

    if (config.saasType === SAASTYPE.api) {
       if (config.api?.template === TEMPLATE.defineApi) {
        await updateYourOwnApi(config, panacloudConfig);
      } 
    }


    stopSpinner(updatingCode, "Code Updated", false);

    const generatingTypes = startSpinner("Generating Types");
    try {
      await exec(`npx graphql-codegen`);
    } catch (error) {
      stopSpinner(generatingTypes, `Error: ${error}`, true);
      process.exit(1);
    }
    stopSpinner(generatingTypes, "Generating Types", false);

    // const formatting = startSpinner("Formatting Code");
    // // Formatting files.
    // const files = await globby(
    //   [
    //     "*",
    //     "**/*.ts",
    //     "!*.gql",
    //     "!*.graphql",
    //     "!?.",
    //     "!*.md",
    //     "!*.lock",
    //     "!*.yaml",
    //     "!*.yml",
    //   ],
    //   {
    //     gitignore: true,
    //   }
    // );
    // files.forEach(async (file: any) => {
    //   const data = fs.readFileSync(file, "utf8");
    //   const nextData = prettier.format(data, {
    //     parser: path.extname(file) === ".json" ? "json" : "typescript",
    //   });
    //   await fs.writeFileSync(file, nextData, "utf8");
    // });

    // stopSpinner(formatting, "Formatting Done", false);

  }
}
