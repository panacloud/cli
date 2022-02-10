var axios = require("axios");
import * as AWS from "aws-sdk";
import { AppSyncResolverEvent } from "aws-lambda";
import { MutationCreateToDoArgs } from "../../customMockLambdaLayer/mockData/types";
import { v4 as uuidv4 } from 'uuid';

const docClient = new AWS.DynamoDB.DocumentClient();
declare var process: {
  env: {
    TableName: string;
  };
};

exports.handler = async (
  event: AppSyncResolverEvent<MutationCreateToDoArgs>
) => {
  const result = await createToDo(event.arguments);
  return result;
};

async function createToDo(args: MutationCreateToDoArgs) {
  
  
  const params = {TableName:process.env.TableName,
     Item: {
      id:uuidv4(),
      title:args.toDoInput?.title,
      description:args.toDoInput?.description
  }}
  const data = await docClient.put(params).promise()
  console.log(data)
  // return args.user.name
  
  return { id: "01", title: "Marsha", description: "Letti" };
}
