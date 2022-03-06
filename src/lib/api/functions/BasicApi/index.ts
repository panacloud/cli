import { startSpinner, stopSpinner } from "../../../spinner";
import {
  writeJsonSync,
  readJsonSync,
  copy,
  readdirSync,
  writeFileSync,
} from "fs-extra";
import { basename } from "path";
import { snakeCase, upperFirst, camelCase } from "lodash";
import { CreateAspects } from "../../generators/Aspects";
import { Config, ApiModel } from "../../../../utils/constants";
import { CdkAppClass } from "../../generators/bin";
import { mkdirRecursiveAsync } from "../../../fs";
const exec = require("await-exec");

async function basicApi(config: Config, templateDir: string): Promise<void> {
  const workingDir = snakeCase(basename(process.cwd()));

  const model: ApiModel = {
    api: {
      ...config.api,
    },
    workingDir: workingDir,
  };

  const generatingCode = startSpinner("Generating CDK Code...");

  /* copy files from global package dir to cwd */
  readdirSync(templateDir).forEach((file: any) => {
    if (
      file !== "package.json" &&
      file !== "cdk.json" &&
      file !== "lambdaLayer" &&
      file !== "graphqlClient"
    ) {
      if (file === "gitignore") {
        copy(`${templateDir}/${file}`, ".gitignore");
      } else {
        copy(`${templateDir}/${file}`, file, (err: Error) => {
          if (err) {
            stopSpinner(generatingCode, `Error: ${err}`, true);
            process.exit(1);
          }
        });
      }
    }
  });

  // Updating fileName
  const stackPackageJson = readJsonSync(`${templateDir}/package.json`);

  const cdkJson = readJsonSync(`${templateDir}/cdk.json`);

  stackPackageJson.bin = `bin/${workingDir}.js`;
  stackPackageJson.name = workingDir;

  cdkJson.app = `npx ts-node --prefer-ts-exts bin/${workingDir}.ts`;

  writeJsonSync(`./package.json`, stackPackageJson);

  writeJsonSync(`./cdk.json`, cdkJson);

  await mkdirRecursiveAsync(`lib`);

  // await CreateAspects({ config: model });
  await CdkAppClass({ config: model });

  writeFileSync(
    `./lib/${model.workingDir}-stack.ts`,
    `import { Stack, StackProps } from "aws-cdk-lib";
    import { Construct } from "constructs";

    interface EnvProps {
      prod?: string;
    }
 
  export class ${upperFirst(
    camelCase(basename(process.cwd()))
  )}Stack extends Stack {
     constructor(scope: Construct, id: string, props?: EnvProps) {
        super(scope, id);
 
   }
 }`
  );

  stopSpinner(generatingCode, "CDK Code Generated", false);

  const installingModules = startSpinner("Installing Modules");

  try {
    await exec(`npm install`);
  } catch (error) {
    stopSpinner(installingModules, `Error: ${error}`, true);
    process.exit(1);
  }

  stopSpinner(installingModules, "Modules installed", false);
}

export default basicApi;
