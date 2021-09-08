import { ApiModel, APITYPE } from "../../../utils/constants";
import { AppsyncApiConstruct } from "./Appsync";

export const generator = async (config: ApiModel) => {
  console.log(config);

  if (config.api.apiType === APITYPE.graphql) {
    AppsyncApiConstruct({ config });
  }
};
