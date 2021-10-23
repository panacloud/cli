import { startSpinner, stopSpinner } from "../../../spinner";
import { writeFileAsync } from "../../../fs";
import { contextInfo } from "../../info";
import { Config } from "../../../../utils/constants";
const git = require("isomorphic-git");
const http = require("isomorphic-git/http/node");
const fs = require("fs");
const exec = require("await-exec");

async function todoApi(config: Config) {
  const generatingCode = startSpinner("Generating CDK Code...");

  const dir = process.cwd();

  await git.clone({
    fs,
    http,
    dir,
    url: "https://github.com/panacloud/todo-saas.git",
    singleBranch: true,
  });

  // await writeFileAsync(
  //   `cdk.context.json`,
  //   JSON.stringify(contextInfo(config.api_token, config.entityId)),
  //   (err: string) => {
  //     if (err) {
  //       stopSpinner(generatingCode, `Error: ${err}`, true);
  //       process.exit(1);
  //     }
  //   }
  // );

  stopSpinner(generatingCode, "CDK Code Generated", false);

  const installingModules = startSpinner("Installing Modules");

  try {
    await exec(`npm install`);
  } catch (error) {
    stopSpinner(installingModules, `Error: ${error}`, true);
    process.exit(1);
  }

  try {
    await exec(`cd lambdaLayer/nodejs && npm install`);
  } catch (error) {
    stopSpinner(installingModules, `Error: ${error}`, true);
    process.exit(1);
  }

  stopSpinner(installingModules, "Modules installed", false);
}

export default todoApi;
