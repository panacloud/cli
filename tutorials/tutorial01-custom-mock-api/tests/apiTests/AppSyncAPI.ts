import { existsSync, readFileSync } from "fs-extra";
import validUrl from "valid-url";
const stage = process.argv[process.argv.length - 1];
if (!existsSync(`./cdk-${stage}-outputs.json`)) {
  console.log(
    `cdk-${stage}-outputs.json file not found.It seems your stack is not deployed.`
  );
  process.exit(1);
}
const appsyncCredentials = JSON.parse(
  readFileSync(`./cdk-${stage}-outputs.json`).toString()
);
const values: string[] = Object.values(
  Object.entries(appsyncCredentials)[0][1] as any
);
export class AppsyncAPI {
  private static instance: AppsyncAPI;
  public API_KEY: string = "";
  public API_URL: string = "";

  private constructor() {
    values.forEach((val: string) => {
      if (validUrl.isUri(val)) {
        this.API_URL = val;
      } else {
        this.API_KEY = val;
      }
    });
  }

  public static getInstance(): AppsyncAPI {
    if (!AppsyncAPI.instance) {
      AppsyncAPI.instance = new AppsyncAPI();
    }

    return AppsyncAPI.instance;
  }
}
