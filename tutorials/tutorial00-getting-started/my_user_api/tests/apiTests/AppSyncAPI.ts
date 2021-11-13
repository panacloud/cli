import validUrl from "valid-url";
import appsyncCredentials from "./appsyncCredentials.json";
const values: string[] = Object.values(
  Object.entries(appsyncCredentials)[0][1]
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
