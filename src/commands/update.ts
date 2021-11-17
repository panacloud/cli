import { Command, flags } from "@oclif/command";
import { startSpinner, stopSpinner } from "../lib/spinner";
import { updateYourOwnApi } from "../lib/api/functions";
import { validateSchemaFile } from "../lib/api/errorHandling";
import { TEMPLATE, SAASTYPE, Config, APITYPE } from "../utils/constants";
import { boolean } from "@oclif/parser/lib/flags";
const path = require("path");
const fse = require("fs-extra");
const fs = require("fs");
const prettier = require("prettier");
const globby = require("globby");
const exec = require("await-exec");
const chalk = require("chalk");

export default class Create extends Command {
  static description = "Updates the Generated Code.";

  static flags = {
    help: flags.help({ char: "h" }),
  };

  async run() {
    const { flags } = this.parse(Create);
    let [schemaChanged, panacloudConfigChanged] = this.isChanged();

    if(schemaChanged && panacloudConfigChanged){
      await this.update();
    }
    else {
      this.log(
        chalk.red(
          "GraphQL Schema and Panacloud Config have not changed, therefore no need to Regenerate and Update Code"
        )
      );
    }
  }

  isChanged(): [boolean, boolean]{
    
    let schemaChanged: boolean = this.areFilesChanged("editable_src/graphql/schema/schema.graphql", 
    ".panacloud/editable_src/graphql/schema/schema.graphql");
    
    let panacloudConfigChanged: boolean = this.areFilesChanged("editable_src/panacloudconfig.json",
    ".panacloud/editable_src/panacloudconfig.json");

    return [schemaChanged, panacloudConfigChanged]; 
   
  }

  areFilesChanged(file1: string, file2: string): boolean {
    let result: boolean = false;
    fs.readFile(file1, (err: any, data1: any) => {
      if (err) throw err;
      
      fs.readFile(file2, (err2: any, data2: any) => {
          if (err) throw err2;
          if (data1.equals(data2)) {
              result = false;
          } else {
              result = true;
          }
  
      });
      
    });
    return result;
  }

  async update(){
    
    const validating = startSpinner("Validating Everything");

    const configCli: Config = fse.readJsonSync("codegenconfig.json");
    
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

    fse.removeSync("mock_lambda", { recursive: true });
    fse.removeSync("lambdaLayer/mockApi", { recursive: true });
    fse.removeSync("consumer_lambda", { recursive: true });
    fse.removeSync("lib", { recursive: true });
    fse.removeSync("tests/apiTests",{recursive:true})

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
      const data = fs.readFileSync(file, "utf8");
      const nextData = prettier.format(data, {
        parser: path.extname(file) === ".json" ? "json" : "typescript",
      });
      await fs.writeFileSync(file, nextData, "utf8");
    });

    stopSpinner(formatting, "Formatting Done", false);



  }
}
