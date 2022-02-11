var axios = require("axios");
import * as AWS from "aws-sdk";
import { AppSyncResolverEvent } from "aws-lambda";
import { process as gprocess } from "gremlin";
const initGremlin = require("/opt/utils/gremlin_init");
exports.handler = async (event: AppSyncResolverEvent<null>) => {
  const { g, conn } = initGremlin.initializeGremlinClient(
    process.env.NEPTUNE_ENDPOINT!
  );

  const result = await deleteToDos(g);
  return result;
};

async function deleteToDos(g: gprocess.GraphTraversalSource) {
  await g.V().hasLabel("todo").drop().iterate();
  return "Deleted all todos";
}
