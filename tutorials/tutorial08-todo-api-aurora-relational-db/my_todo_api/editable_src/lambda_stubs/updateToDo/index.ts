var axios = require("axios");
import * as AWS from "aws-sdk";
import { AppSyncResolverEvent } from "aws-lambda";
import { MutationUpdateToDoArgs } from "../../customMockLambdaLayer/mockData/types";
const db = require("data-api-client")({
  secretArn: process.env.SECRET_ARN,
  resourceArn: process.env.CLUSTER_ARN,
  database: process.env.DB_NAME,
});
exports.handler = async (
  event: AppSyncResolverEvent<MutationUpdateToDoArgs>
) => {
  const result = await updateToDo(event.arguments);
  return result;
};

async function updateToDo(args: MutationUpdateToDoArgs) {
  await db.query(
    `CREATE TABLE IF NOT EXISTS todos (id serial, title TEXT,description TEXT, PRIMARY KEY (id))`
  );
  const todo = await db.query(
    `UPDATE todos SET title = :title,description = :description WHERE id = :id RETURNING *`,
    {
      title: args.toDoInput?.title,
      description: args.toDoInput?.description,
      id: args.toDoId,
    }
  );
  return todo.records[0];
}
