var axios = require("axios");
import * as AWS from "aws-sdk";
import { AppSyncResolverEvent } from "aws-lambda";
import { QueryGetToDoArgs } from "../../customMockLambdaLayer/mockData/types";
import { process as gprocess } from "gremlin";
const initGremlin = require("/opt/utils/gremlin_init");
exports.handler = async (event: AppSyncResolverEvent<QueryGetToDoArgs>) => {
  const { g, conn } = initGremlin.initializeGremlinClient(
    process.env.NEPTUNE_ENDPOINT!
  );

  const result = await getToDo(event.arguments, g);
  return result;
};

async function getToDo(
  args: QueryGetToDoArgs,
  g: gprocess.GraphTraversalSource
) {
  const data = await g.V(args.toDoId).elementMap().next();

  return data.value;
}
