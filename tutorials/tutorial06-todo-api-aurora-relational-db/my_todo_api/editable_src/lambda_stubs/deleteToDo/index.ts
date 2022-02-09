var axios = require("axios");
import * as AWS from "aws-sdk";
import { AppSyncResolverEvent } from "aws-lambda";
import { MutationDeleteToDoArgs } from "../../customMockLambdaLayer/mockData/types";
const db = require("data-api-client")({
  secretArn: process.env.SECRET_ARN,
  resourceArn: process.env.CLUSTER_ARN,
  database: process.env.DB_NAME,
});
exports.handler = async (
  event: AppSyncResolverEvent<MutationDeleteToDoArgs>
) => {
  const result = await deleteToDo(event.arguments);
  return result;
};

async function deleteToDo(args: MutationDeleteToDoArgs) {
  
  
  await db.query(
    `CREATE TABLE IF NOT EXISTS todos (id serial, title TEXT,description TEXT, PRIMARY KEY (id))`
  );
  const todo = await db.query(`DELETE FROM todos WHERE id = :id RETURNING *`,{ id:args.toDoId});
  return "todo deleted"
}
