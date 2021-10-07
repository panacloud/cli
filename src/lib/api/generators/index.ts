import {
  ApiModel,
  APITYPE,
  DATABASE,
  LAMBDASTYLE,
} from "../../../utils/constants";
import { ApiGatewayConstruct } from "./ApiGateway";
import { AppsyncApiConstruct } from "./Appsync";
import { auroraDBConstruct } from "./AuroraServerless";
import { CdkAppClass } from "./bin";
import { AppsyncConstructTest } from "./CdkTests/Appsync";
import { auroraDBConstructTest } from "./CdkTests/AuroraServerless";
import { dynamodbConstructTest } from "./CdkTests/Dynamodb";
import { lambdaConstructTest } from "./CdkTests/Lambda";
import { neptuneDBConstructTest } from "./CdkTests/Neptune";
import { dynamoDBConstruct } from "./DynamoDB";
import { LambdaConstruct } from "./Lambda";
import { multipleLambda } from "./Lambda/multipleLambda";
import { customMultipleLambda } from "./Lambda/customMultipleLambda";

import { singleLambda } from "./Lambda/singleLambda";
import { mockApiTestCollections } from "./MockApi";
import { neptuneDBConstruct } from "./Neptune";
import { CdkStackClass } from "./Stack";
import { panacloudConfig } from "./PanacloudConfig";

export const generator = async (config: ApiModel) => {
  // bin file
  CdkAppClass({ config });

  // stack
  CdkStackClass({ config });

  // Appsync or Apigateway
  if (config.api.apiType === APITYPE.graphql) {
    AppsyncApiConstruct({ config });
    AppsyncConstructTest({ config });
  } else if (config.api.apiType === APITYPE.rest) {
    ApiGatewayConstruct({ config });
  }

  // Databases
  if (config.api.database === DATABASE.auroraDB) {
    auroraDBConstruct({ config });
    auroraDBConstructTest({ config });
  }
  if (config.api.database === DATABASE.neptuneDB) {
    neptuneDBConstruct({ config });
    neptuneDBConstructTest({ config });
  }
  if (config.api.database === DATABASE.dynamoDB) {
    dynamoDBConstruct({ config });
    dynamodbConstructTest({ config });
  }

  // lambda Test
  lambdaConstructTest({ config });
  // lambda Construct
  LambdaConstruct({ config });

  // Single or Multi
  if (
    config.api.lambdaStyle === LAMBDASTYLE.single ||
    config.api.apiType === APITYPE.rest
  ) {
    singleLambda({ config });
  }
  if (config.api.lambdaStyle === LAMBDASTYLE.multi) {
    multipleLambda({ config });
    customMultipleLambda({ config });
    panacloudConfig({config})
  }

  if (config.api.mockApi) {
    mockApiTestCollections({ config });
  }
};
