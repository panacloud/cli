var axios = require("axios");
import * as AWS from "aws-sdk";
import { AppSyncResolverEvent } from "aws-lambda";
import { MutationCreateToDoArgs } from "../../customMockLambdaLayer/mockData/types";
const db = require("data-api-client")({
  secretArn: process.env.SECRET_ARN,
  resourceArn: process.env.CLUSTER_ARN,
  database: process.env.DB_NAME,
});
exports.handler = async (
  event: AppSyncResolverEvent<MutationCreateToDoArgs>
) => {
  const result = await createToDo(event.arguments);
  return result;
};

async function createToDo(args: MutationCreateToDoArgs) {
  await db.query(
    `CREATE TABLE IF NOT EXISTS todos (id serial, title TEXT,description TEXT, PRIMARY KEY (id))`
  );
  const todo = await db.query(
    `INSERT INTO todos (title,description) VALUES(:title,:description) RETURNING *`,
    { title: args.toDoInput?.title, description: args.toDoInput?.description }
  );
  return todo;
}
