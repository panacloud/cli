var axios = require("axios");
import * as AWS from "aws-sdk";
import { AppSyncResolverEvent } from "aws-lambda";
import { MutationCreateToDoArgs } from "../../customMockLambdaLayer/mockData/types";
import { process as gprocess } from "gremlin";
const initGremlin = require("/opt/utils/gremlin_init");
exports.handler = async (
  event: AppSyncResolverEvent<MutationCreateToDoArgs>
) => {
  const { g, conn } = initGremlin.initializeGremlinClient(
    process.env.NEPTUNE_ENDPOINT!
  );

  const result = await createToDo(event.arguments, g);
  return result;
};

async function createToDo(
  args: MutationCreateToDoArgs,
  g: gprocess.GraphTraversalSource
) {
  const data = await g
    .addV("todo")
    .property("title", args.toDoInput?.title)
    .property("description", args.toDoInput?.description)
    .next();
  return {
    id: data.value.id,
    title: args.toDoInput?.title,
    description: args.toDoInput?.description,
  };
}
