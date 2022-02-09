var axios = require("axios");
import * as AWS from "aws-sdk";
import { AppSyncResolverEvent } from "aws-lambda";
import { QueryGetToDoArgs } from "../../customMockLambdaLayer/mockData/types";
const db = require("data-api-client")({
  secretArn: process.env.SECRET_ARN,
  resourceArn: process.env.CLUSTER_ARN,
  database: process.env.DB_NAME,
});
exports.handler = async (event: AppSyncResolverEvent<QueryGetToDoArgs>) => {
  const result = await getToDo(event.arguments);
  return result;
};

async function getToDo(args: QueryGetToDoArgs) {
  
  await db.query(
    `CREATE TABLE IF NOT EXISTS todos (id serial, title TEXT,description TEXT, PRIMARY KEY (id))`
  );
  const todo = await db.query(`SELECT * FROM todos WHERE id = :id RETURNING *`,{ id:args.toDoId});
  return todo.records[0];
}
