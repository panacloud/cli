import { APITYPE } from "../../../utils/constants";
import { AppsyncApiConstruct } from "./Appsync";
import { auroraDBConstruct } from "./AuroraServerless";
import { CdkAppClass } from "./bin";
import { dynamoDBConstruct } from "./DynamoDB";
import { LambdaConstruct } from "./Lambda";
import { handlers } from "./Lambda/handler";
import { lambdaHandlers } from "./Lambda/lambdaHandlers";
import { neptuneDBConstruct } from "./Neptune";
import { CdkStackClass } from "./Stack";

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
};
