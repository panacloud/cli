import { Command, flags } from "@oclif/command";
import chalk = require("chalk");
import {
  existsSync,
  readFileSync,
  writeJsonSync,
} from "fs-extra";
import { startSpinner} from "../lib/spinner";
import * as validUrl from "valid-url";
import { API, APITYPE } from "../utils/constants";
const express = require("express");


export default class Open extends Command {
  static description = "describe the command here";

  static flags = {
    help: flags.help({ char: "h" }),
  };

  static args = [{ name: "file" }];
  async run() {
    const { apiType, apiName }: API = JSON.parse(
      readFileSync("./codegenconfig.json").toString()
    ).api;
    if (apiType === APITYPE.graphql) {
      let API_URL;
      let API_KEY;
      if (!existsSync("./cdk-outputs.json")) {
        this.log(
          chalk.red(
            `${apiName} is currently not deployed client cannot connect to API, give the command npm run deploy to deploy it.`
          )
        );
      } else {
        let data = JSON.parse(readFileSync("./cdk-outputs.json").toString());
        const values: string[] = Object.values(
          Object.entries(data)[0][1] as any
        );
        if (values.length === 0) {
          this.log(
            chalk.red(
              `${apiName} is currently not deployed client cannot connect to API, give the npm run deploy to deploy it.`
            )
          );
          return;
        } else {
          values.forEach((val: string) => {
            if (validUrl.isUri(val)) {
              API_URL = val;
            } else {
              API_KEY = val;
            }
          });
          if (API_URL && API_KEY) {
            writeJsonSync(`./graphqlClient/data.json`, {
              API_URL,
              API_KEY,
            });
            this.runGraphqlClient();
          }
        }
      }
    }
  }

  async runGraphqlClient() {
    const graphqlSpinner = startSpinner("Starting Grphql Client");
    let app = express();
    app.use(express.static(process.cwd() + "/graphqlClient/"));
    let port = 8080;
    app.listen(port);
    graphqlSpinner.stopAndPersist({
      text: `Graphql client is running on http://localhost:${port} 🚀`,
    });
  }
}
