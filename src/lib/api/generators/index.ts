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
import { multipleLambda } from "./Lambda/multipleLambda";
import { customLambda } from "./Lambda/customLambda";
import { singleLambda } from "./Lambda/singleLambda";
import { mockApiTestCollections } from "./MockApi";
import { EditableMockApiTestCollections } from "./MockApi/editableMockApi";
import { neptuneDBConstruct } from "./Neptune";
import { CdkStackClass } from "./Stack";
import { eventBridgeConstruct } from "./EventBridge";
import { TestCollectionType } from "../apiMockDataGenerator";
import { apiTests } from "../generateApiTests";
import { execSync } from "child_process";

export const generator = async (config: ApiModel, panacloudConfig: PanacloudconfigFile, type: string, dummyData: TestCollectionType) => {
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
    // neptuneDBConstructTest({ config });
  }
  if (config.api.database === DATABASE.dynamoDB) {
    await dynamoDBConstruct({ config });
    // dynamodbConstructTest({ config });
  }

  // lambda Test
  // lambdaConstructTest({ config });
  // lambda Construct



  // Single or Multi
  if (config.api.apiType === APITYPE.rest) {
    await singleLambda({ config });
  }
  else if (config.api.apiType === APITYPE.graphql) {
    await multipleLambda({ config });
    await mockApiTestCollections({ config, dummyData });
    await EditableMockApiTestCollections({ config, dummyData, type })
    await customLambda({ config, type });
  }

  if (config.api.asyncFields &&  config.api.asyncFields.length >0) {
    await eventBridgeConstruct({ config })
  }
  apiTests({config})
  config.api.schemaPath
  execSync(`npx gqlg --schemaFilePath ${config.api.schemaPath} --destDirPath ./tests/apiTests/graphql/`)

};

