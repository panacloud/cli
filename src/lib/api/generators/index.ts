<<<<<<< HEAD
import { APITYPE } from "../../../utils/constants";
import { AppsyncApiConstruct } from "./Appsync";
import { auroraDBConstruct } from "./AuroraServerless";
import { CdkAppClass } from "./bin";
=======
import { ApiModel, APITYPE, DATABASE } from "../../../utils/constants";
import { ApiGatewayConstruct } from "./ApiGateway";
import { AppsyncApiConstruct } from "./Appsync";
import { auroraDBConstruct } from "./AuroraServerless";
import { CdkAppClass } from "./bin";
import { appsyncConstructTest } from "./CdkTests/Appsync";
import { auroraDBConstructTest } from "./CdkTests/AuroraServerless";
import { dynamodbConstructTest } from "./CdkTests/Dynamodb";
import { lambdaConstructTest } from "./CdkTests/Lambda";
import { neptuneDBConstructTest } from "./CdkTests/Neptune";
>>>>>>> dev
import { dynamoDBConstruct } from "./DynamoDB";
import { LambdaConstruct } from "./Lambda";
import { handlers } from "./Lambda/handler";
import { lambdaHandlers } from "./Lambda/lambdaHandlers";
import { neptuneDBConstruct } from "./Neptune";
import { CdkStackClass } from "./Stack";

<<<<<<< HEAD
export const generator = async (model: any) => {
  console.log("model====>",model);
  if(model.api.apiType=== APITYPE.graphql){
     await AppsyncApiConstruct({config:model,schema:model.type})
  }
  await dynamoDBConstruct({config:model})
  await neptuneDBConstruct({config:model})
  await auroraDBConstruct({config:model})
  await CdkAppClass({config:model})
  await CdkStackClass({config:model})
  await AppsyncApiConstruct({config:model,schema:model.type})
  await LambdaConstruct({config:model,schema:model.type})
  await lambdaHandlers({config:model})
  await handlers({config:model})
=======
export const generator = async (config: ApiModel) => {
  // bin file
  CdkAppClass({ config });

  // stack
  CdkStackClass({ config });

  // Appsync or Apigateway
  if (config.api.apiType === APITYPE.graphql) {
    AppsyncApiConstruct({ config });
    appsyncConstructTest({ config });
  } else if (config.api.apiType === APITYPE.rest) {
    ApiGatewayConstruct({ config });
  }

  // Databases
  if (config.api.database === DATABASE.auroraDB) {
    auroraDBConstruct({ config });
    auroraDBConstructTest({ config });
  } else if (config.api.database === DATABASE.neptuneDB) {
    neptuneDBConstruct({ config });
    neptuneDBConstructTest({ config });
  } else {
    dynamoDBConstruct({ config });
    dynamodbConstructTest({ config });
  }

  // lambda Test
  lambdaConstructTest({ config });
  // lambda Construct
  LambdaConstruct({ config });

  // handlers
  handlers({ config });
  lambdaHandlers({ config });
>>>>>>> dev
};
