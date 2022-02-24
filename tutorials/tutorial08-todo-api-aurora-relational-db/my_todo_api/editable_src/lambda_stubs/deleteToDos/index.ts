var axios = require("axios");
import * as AWS from "aws-sdk";
import { AppSyncResolverEvent } from "aws-lambda";
const db = require("data-api-client")({
  secretArn: process.env.SECRET_ARN,
  resourceArn: process.env.CLUSTER_ARN,
  database: process.env.DB_NAME,
});
exports.handler = async (event: AppSyncResolverEvent<null>) => {
  const result = await deleteToDos();
  return result;
};

async function deleteToDos() {
  await db.query(
    `CREATE TABLE IF NOT EXISTS todos (id serial, text TEXT,completed BOOLEAN, PRIMARY KEY (id))`
  );
  const todo = await db.query(`DELETE FROM todos RETURNING *`);
  console.log(todo);
  return todo.records[0];
}
