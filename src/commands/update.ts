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
const fse = require("fs-extra");
const fs = require("fs");
const prettier = require("prettier");
const globby = require("globby");
const exec = require("await-exec");
const camelCase = require("lodash/camelCase");

export default class Create extends Command {
  static description = "Generates CDK code based on the given schema";

  static flags = {
    help: flags.help({ char: "h" }),
  };

  async run() {
    const { flags } = this.parse(Create);



   const validating = startSpinner("Validating files");
   
    const configCli:Config = fse.readJsonSync('codegenconfig.json')
  
    if (configCli.saasType === SAASTYPE.api) {
      if (configCli.api.apiType === APITYPE.graphql){
      if (configCli.api?.template === TEMPLATE.defineApi) {
        validateSchemaFile(
          configCli.api?.schemaPath,
          validating,
          configCli.api?.apiType
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


    fse.removeSync('mock_lambda', { recursive: true });
    fse.removeSync('consumer_lambda', { recursive: true });
    fse.removeSync('lib', { recursive: true });

    if (configCli.saasType === SAASTYPE.api) {
       if (configCli.api?.template === TEMPLATE.defineApi) {
       await updateYourOwnApi(configCli,updatingCode);
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
    stopSpinner(generatingTypes, "Types generated", false);

    // const formatting = startSpinner("Formatting Code");
    // // // Formatting files.
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

    // console.log("files ", files);
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
