var axios = require("axios");
import * as AWS from "aws-sdk";
import { AppSyncResolverEvent } from "aws-lambda";
import { MutationDeleteToDoArgs } from "../../customMockLambdaLayer/mockData/types";
import { process as gprocess } from "gremlin";
const initGremlin = require("/opt/utils/gremlin_init");
exports.handler = async (
  event: AppSyncResolverEvent<MutationDeleteToDoArgs>
) => {
  const { g, conn } = initGremlin.initializeGremlinClient(
    process.env.NEPTUNE_ENDPOINT!
  );

  const result = await deleteToDo(event.arguments, g);
  return result;
};

async function deleteToDo(
  args: MutationDeleteToDoArgs,
  g: gprocess.GraphTraversalSource
) {
  await g.V(args.toDoId).drop().iterate();
  return "todo deleted";
}
