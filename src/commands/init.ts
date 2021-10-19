import { Command, flags } from "@oclif/command";
import { startSpinner, stopSpinner } from "../lib/spinner";
import { basicApi, todoApi, defineYourOwnApi } from "../lib/api/functions";
import { userInput } from "../lib/inquirer";
import {
  checkEmptyDirectoy,
  validateSchemaFile,
} from "../lib/api/errorHandling";
import {
  TEMPLATE,
  SAASTYPE,
  Config,
  DATABASE,
  LANGUAGE,
  CLOUDPROVIDER,
  APITYPE,
} from "../utils/constants";
import { writeFileAsync } from "../lib/fs";
const path = require("path");
const chalk = require("chalk");
const fs = require("fs");
const prettier = require("prettier");
const globby = require("globby");
const exec = require("await-exec");
const camelCase = require("lodash/camelCase");

export default class Create extends Command {
  static description = "Generates CDK code based on the given schema";

  static flags = {
    help: flags.help({ char: "h" }),
    test: flags.string({ char: "t" }),
  };

  async run() {
    const { flags } = this.parse(Create);
    let config: Config;
    if (flags.test && flags.test === "mateen7861") {
      config = {
        entityId: "assdsad",
        api_token: "asd",
        saasType: "API" as any,
        api: {
          template: "Define Your Own API" as any,
          language: "TypeScript" as any,
          cloudprovider: "AWS" as any,
          architecture: "Request-Driven Architecture" as any,
          apiName: "myApi",
          schemaPath: "../test/test-schemas/todo.graphql",
          apiType: "GraphQL" as any,
          lambdaStyle: "Multiple" as any,
          mockApi: true,
          database: DATABASE.dynamoDB,
        } as any,
      };
    } else {
      let usrInput = await userInput();
      config = {
        entityId: usrInput.entityId,
        api_token: usrInput.api_token,
        saasType: usrInput.saas_type,
        api: {
          template: usrInput.template,
          nestedResolver: usrInput.nestedResolver,
          language: usrInput.language,
          cloudprovider: usrInput.cloud_provider,
          apiName: camelCase(usrInput.api_name),
          schemaPath: usrInput.schema_path,
          apiType: usrInput.api_type,
          database:
            usrInput.database === DATABASE.none ? undefined : usrInput.database,
          architecture: usrInput.architecture,
        },
      };
    }

    let templateDir;

    // Questions

    // Config to generate code.
    // Error handling
    const validating = startSpinner("Validating Everything");

    if (config.saasType === SAASTYPE.api) {
      templateDir = path.resolve(__dirname, "../lib/api/template");
      checkEmptyDirectoy(validating);
      if (config.api?.template === TEMPLATE.defineApi) {
        validateSchemaFile(
          config.api?.schemaPath,
          validating,
          config.api?.apiType
        );
      }
    }

    writeFileAsync(
      `./codegenconfig.json`,
      JSON.stringify({
        ...config,
        api: {
          ...config.api,
          schemaPath: "./editable_src/graphql/schema/schema.graphql",
        },
      }),
      (err: string) => {
        if (err) {
          stopSpinner(validating, `Error: ${err}`, true);
          process.exit(1);
        }
      }
    );

    stopSpinner(validating, "Everything's fine", false);

    if (config.saasType === SAASTYPE.api) {
      if (config?.api?.template === TEMPLATE.todoApi) {
        await todoApi(config);
      } else if (config.api?.template === TEMPLATE.defineApi) {
        await defineYourOwnApi(config, templateDir);
      } else {
        await basicApi(config, templateDir);
      }
    }

    const generatingTypes = startSpinner("Generating Types");

    try {
      await exec(`npx graphql-codegen`);
    } catch (error) {
      stopSpinner(generatingTypes, `Error: ${error}`, true);
      process.exit(1);
    }

    stopSpinner(generatingTypes, "Generating Types", false);

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

    this.log(chalk.greenBright("Build your Billion Dollar API"));
  }
}
