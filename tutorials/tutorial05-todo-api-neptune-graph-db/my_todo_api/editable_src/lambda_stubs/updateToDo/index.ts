var axios = require("axios");
import * as AWS from "aws-sdk";
import { AppSyncResolverEvent } from "aws-lambda";
import { MutationUpdateToDoArgs } from "../../customMockLambdaLayer/mockData/types";
import { process as gprocess } from "gremlin";
const initGremlin = require("/opt/utils/gremlin_init");
exports.handler = async (
  event: AppSyncResolverEvent<MutationUpdateToDoArgs>
) => {
  const { g, conn } = initGremlin.initializeGremlinClient(
    process.env.NEPTUNE_ENDPOINT!
  );

  const result = await updateToDo(event.arguments, g);
  return result;
};

async function updateToDo(
  args: MutationUpdateToDoArgs,
  g: gprocess.GraphTraversalSource
) {
   await g
    .V(args.toDoId)
    .property("title", args.toDoInput?.title)
    .property("description", args.toDoInput?.description)
    .next();
  
  return { id: args.toDoId, title: args.toDoInput?.title, description: args.toDoInput?.description};
}
