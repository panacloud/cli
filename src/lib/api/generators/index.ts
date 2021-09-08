import { ApiModel, APITYPE } from "../../../utils/constants";
import { ApiGatewayConstruct } from "./ApiGateway";
import { AppsyncApiConstruct } from "./Appsync";
import { CdkAppClass } from "./bin";

export const generator = async (config: ApiModel) => {
  console.log(config);

  // bin file
  CdkAppClass({config})

  // Appsync or Apigateway 
  if (config.api.apiType === APITYPE.graphql) {
    AppsyncApiConstruct({ config });
  } else if (config.api.apiType === APITYPE.rest) {
    ApiGatewayConstruct({ config });
  }

};
