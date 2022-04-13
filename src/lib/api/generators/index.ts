import {
  ApiModel,
  APITYPE,
  DATABASE,
  NEPTUNEQUERYLANGUAGE,
  PanacloudconfigFile,
} from "../../../utils/constants";
import { ApiGatewayConstruct } from "./ApiGateway";
import { AppsyncApiConstruct } from "./Appsync";
import { auroraDBConstruct } from "./AuroraServerless";
import { CdkAppClass } from "./bin";
import { dynamoDBConstruct } from "./DynamoDB";
import { multipleLambda } from "./Lambda/multipleLambda";
import { customLambda } from "./Lambda/customLambda";
import { singleLambda } from "./Lambda/singleLambda";
import { mockApiTestCollections } from "./MockApi";
import { EditableMockApiTestCollections } from "./MockApi/editableMockApi";
import { neptuneDBConstruct } from "./Neptune";
import { CdkStackClass } from "./Stack";
import { eventBridgeConstruct } from "./EventBridge";
import { TestCollectionType } from "../apiMockDataGenerator";
import { apiTests } from "./ApiTests";
import { GremlinSetup } from "./Neptune/gremlinSetup";
import { rdsConstruct } from "./Rds";
const fs = require("fs");
export const generator = async (
  config: ApiModel,
  panacloudConfig: PanacloudconfigFile,
  type: string,
  dummyData: TestCollectionType
) => {
  // bin file
  await CdkAppClass({ config });

  // stack
  await CdkStackClass({ config, panacloudConfig });

  // Appsync or Apigateway && Lambda Files
  if (config.api.apiType === APITYPE.graphql) {
    await AppsyncApiConstruct({ config });
    // AppsyncConstructTest({ config });
  } else if (config.api.apiType === APITYPE.rest) {
    await ApiGatewayConstruct({ config });
  }

  // Databases
  if (config.api.database === DATABASE.auroraDB) {
    await auroraDBConstruct({ config });
    // auroraDBConstructTest({ config });
  }
  if (config.api.database === DATABASE.neptuneDB) {
    await neptuneDBConstruct({ config });
    if (config.api.neptuneQueryLanguage === NEPTUNEQUERYLANGUAGE.gremlin) {
      await GremlinSetup({ config });
    }
    // neptuneDBConstructTest({ config });
  }
  if (config.api.database === DATABASE.dynamoDB) {
    await dynamoDBConstruct({ config });
    // dynamodbConstructTest({ config });
  }

  if (config.api.database === DATABASE.rds) {
    await rdsConstruct({ config });
  }

  // Single or Multi
  if (config.api.apiType === APITYPE.rest) {
    await singleLambda({ config });
  } else if (config.api.apiType === APITYPE.graphql) {
    await multipleLambda({ config });
    await mockApiTestCollections({ config, dummyData });
    await EditableMockApiTestCollections({ config, dummyData, type });
    await customLambda({ config, type });
  }
  // if (config.api.apiType === APITYPE.graphql) {
  //   apiTests({ config }, panacloudConfig);
  // }

  if (config.api.asyncFields && config.api.asyncFields.length > 0) {
    await eventBridgeConstruct({ config });
  }
};
