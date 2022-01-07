import { Command, flags } from "@oclif/command";
import { camelCase } from "lodash";
import { resolve, extname } from "path";
import { writeJsonSync, readFileSync, writeFileSync } from "fs-extra";
import { greenBright } from "chalk";
import * as globby from "globby";
import { startSpinner, stopSpinner } from "../lib/spinner";
import { basicApi, defineYourOwnApi } from "../lib/api/functions";
import { userInput } from "../lib/inquirer";
import {
  checkEmptyDirectoy,
  validateGraphqlSchemaFile,
} from "../lib/api/errorHandling";
import {
  SAASTYPE,
  Config,
  DATABASE,
  APITYPE,
  CLOUDPROVIDER,
  LANGUAGE,
  NEPTUNEQUERYLANGUAGE,
  RDBMSENGINE,
  TEMPLATE,
} from "../utils/constants";
const prettier = require("prettier");
const exec = require("await-exec");

export default class Create extends Command {
  static description = "Generates CDK code based on the given schema";

  static flags = {
    help: flags.help({ char: "h" }),
    test: flags.boolean({ char: "t" }),
    database: flags.enum({
      char: "d",
      options: [DATABASE.dynamoDB, DATABASE.neptuneDB, DATABASE.auroraDB],
    }),
  };

  async run() {
    const { flags } = this.parse(Create);

    let templateDir: string;
    let config: Config;
    // Questions
    const placeholder = process.argv[1];
    if (
      flags.test &&
      !(
        placeholder.includes("node_modules") ||
        placeholder.includes("@panacloud") ||
        placeholder.includes("npm")
      )
    ) {
      config = {
        entityId: "",
        api_token: "",
        saasType: SAASTYPE.api,
        api: {
          template: TEMPLATE.defineApi,
          nestedResolver: false,
          language: LANGUAGE.typescript,
          cloudprovider: CLOUDPROVIDER.aws,
          apiName: "cliTesting",
          schemaPath: "../test/test-schemas/todo.graphql",
          apiType: APITYPE.graphql,
          database: flags.database,
          neptuneQueryLanguage:
            flags.database === DATABASE.neptuneDB
              ? NEPTUNEQUERYLANGUAGE.gremlin
              : undefined,
          rdbmsEngine:
            flags.database === DATABASE.neptuneDB
              ? RDBMSENGINE.mysql
              : undefined,
        },
      };
    } else {
      let usrInput = await userInput();
      config = {
        // entityId: "",
        // api_token: "",
        saasType: SAASTYPE.api,
        api: {
          template: usrInput.template,
          multitenancy: false,
          nestedResolver: false,
          language: LANGUAGE.typescript,
          cloudprovider: CLOUDPROVIDER.aws,
          apiName: camelCase(usrInput.api_name),
          schemaPath: usrInput.schema_path,
          apiType: APITYPE.graphql,
          database: usrInput.database,
          rdbmsEngine: usrInput.rdbmsEngine,
          neptuneQueryLanguage: usrInput.neptuneQueryLanguage,
        },
      };
    }

    // Error handling
    const validating = startSpinner("Validating Everything");

    if (config!.saasType === SAASTYPE.api) {
      templateDir = resolve(__dirname, "../lib/api/template");
      checkEmptyDirectoy(validating);
      if (config.api.template === TEMPLATE.defineApi) {
        validateGraphqlSchemaFile(config!.api?.schemaPath, validating, "init");
      }
    }

    writeJsonSync(`./codegenconfig.json`, {
      ...config,
      api: {
        ...config.api,
        schemaPath: "./editable_src/graphql/schema/schema.graphql",
      },
    });

    stopSpinner(validating, "Everything's fine", false);

    if (config.saasType === SAASTYPE.api) {
      if (config.api.apiType === APITYPE.graphql) {
        if (config.api.template === TEMPLATE.basicApi) {
          await basicApi(config, templateDir!);
        } else if (config.api.template === TEMPLATE.defineApi) {
          await defineYourOwnApi(config, templateDir!);
        }
      }
    }

    // const setUpForTest = startSpinner("Setup For Test");

    // try {
    //   await exec(
    //     `npx gqlg --schemaFilePath ./editable_src/graphql/schema/schema.graphql --destDirPath ./tests/apiTests/graphql/`
    //   );
    // } catch (error) {
    //   stopSpinner(setUpForTest, `Error: ${error}`, true);
    //   process.exit(1);
    // }

    // stopSpinner(setUpForTest, "Setup For Test", false);

    if (
      config.api.apiType === APITYPE.graphql &&
      config.api.template === TEMPLATE.defineApi
    ) {
      const generatingTypes = startSpinner("Generating Types");

      try {
        await exec(`npx graphql-codegen`);
      } catch (error) {
        stopSpinner(generatingTypes, `Error: ${error}`, true);
        process.exit(1);
      }

      stopSpinner(generatingTypes, "Generated Types", false);
    }

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

    this.log(
      greenBright(
        "Now Start Building Your Multi-Tenant Serverless Unicorn APIs"
      )
    );

    this.log(greenBright("Your code goes inside editable_src directory"));
  }
}
