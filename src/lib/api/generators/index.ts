import {
  ApiModel,
  APITYPE,
  DATABASE,
  ARCHITECTURE,
  PanacloudconfigFile,
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
import { customLambda } from "./Lambda/customLambda";
import { singleLambda } from "./Lambda/singleLambda";
import { mockApiTestCollections } from "./MockApi";
import { neptuneDBConstruct } from "./Neptune";
import { CdkStackClass } from "./Stack";
import { eventBridgeConstruct } from "./EventBridge";

export const generator = async (config: ApiModel, panacloudConfig: PanacloudconfigFile) => {
  // bin file
  CdkAppClass({ config });

  // stack
  CdkStackClass({ config, panacloudConfig });

  console.log("panacloud config ---<",panacloudConfig)

  // Appsync or Apigateway && Lambda Files
  if (config.api.apiType === APITYPE.graphql) {
    AppsyncApiConstruct({ config });
    // AppsyncConstructTest({ config });

  } else if (config.api.apiType === APITYPE.rest) {
    ApiGatewayConstruct({ config });
  }

  // Databases
  if (config.api.database === DATABASE.auroraDB) {
    auroraDBConstruct({ config });
    // auroraDBConstructTest({ config });
  }
  if (config.api.database === DATABASE.neptuneDB) {
    neptuneDBConstruct({ config });
    // neptuneDBConstructTest({ config });
  }
  if (config.api.database === DATABASE.dynamoDB) {
    dynamoDBConstruct({ config });
    // dynamodbConstructTest({ config });
  }

  // lambda Test
  // lambdaConstructTest({ config });
  // lambda Construct
  LambdaConstruct({ config, panacloudConfig });

  // Single or Multi
  if (config.api.apiType === APITYPE.rest) {
        singleLambda({ config });
  }
  else if (config.api.apiType === APITYPE.graphql) {
    multipleLambda({ config });
    mockApiTestCollections({ config });
    customLambda({ config });
  }

  if (config.api.architecture === ARCHITECTURE.eventDriven) {
    eventBridgeConstruct({ config })
  }

};
