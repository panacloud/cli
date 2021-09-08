import { ApiModel, APITYPE, DATABASE } from "../../../utils/constants";
import { ApiGatewayConstruct } from "./ApiGateway";
import { AppsyncApiConstruct } from "./Appsync";
import { auroraDBConstruct } from "./AuroraServerless";
import { CdkAppClass } from "./bin";
import { dynamoDBConstruct } from "./DynamoDB";
import { neptuneDBConstruct } from "./Neptune";
import { CdkStackClass } from "./Stack";

export const generator = async (config: ApiModel) => {
  console.log(config);

  // bin file
  CdkAppClass({ config });

  // stack
  CdkStackClass({ config });

  // Appsync or Apigateway
  if (config.api.apiType === APITYPE.graphql) {
    AppsyncApiConstruct({ config });
  } else if (config.api.apiType === APITYPE.rest) {
    ApiGatewayConstruct({ config });
  }

  // Databases
  if (config.api.database === DATABASE.auroraDB) {
    auroraDBConstruct({ config });
  } else if (config.api.database === DATABASE.neptuneDB) {
    neptuneDBConstruct({ config });
  } else {
    dynamoDBConstruct({ config });
  }
};
