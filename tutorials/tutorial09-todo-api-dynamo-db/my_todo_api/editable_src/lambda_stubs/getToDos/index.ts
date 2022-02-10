var axios = require("axios");
import * as AWS from "aws-sdk";
import { AppSyncResolverEvent } from "aws-lambda";
const docClient = new AWS.DynamoDB.DocumentClient();
declare var process: {
  env: {
    TableName: string;
  };
};

exports.handler = async (event: AppSyncResolverEvent<null>) => {
  const result = await getToDos();
  return result;
};

async function getToDos() {
  const params = { TableName: process.env.TableName };
  const data = await docClient.scan(params).promise();
  return data.Items;
}
