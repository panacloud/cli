var axios = require("axios");
import * as AWS from "aws-sdk";
import { AppSyncResolverEvent } from "aws-lambda";
import { MutationDeleteToDoArgs } from "../../customMockLambdaLayer/mockData/types";
const docClient = new AWS.DynamoDB.DocumentClient();
declare var process: {
  env: {
    TableName: string;
  };
};

exports.handler = async (
  event: AppSyncResolverEvent<MutationDeleteToDoArgs>
) => {
  const result = await deleteToDo(event.arguments);
  return result;
};

async function deleteToDo(args: MutationDeleteToDoArgs) {
  const params = {
    TableName: process.env.TableName,
    Key: {
      id: args.toDoId,
    },
  };
  const data = await docClient.delete(params).promise();
  console.log(data);
  return { id: "01", title: "Berna", description: "Doreen" };
}
