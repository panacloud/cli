import { APITYPE } from "../../../utils/constants";
import { AppsyncApiConstruct } from "./Appsync";
import { auroraDBConstruct } from "./AuroraServerless";
import { CdkAppClass } from "./bin";
import { dynamoDBConstruct } from "./DynamoDB";
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
};
