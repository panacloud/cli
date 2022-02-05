var axios = require("axios");
import * as AWS from "aws-sdk";
import { AppSyncResolverEvent } from "aws-lambda";
import { QueryUserArgs } from "../../customMockLambdaLayer/mockData/types";
const docClient = new AWS.DynamoDB.DocumentClient();
declare var process: {
  env: {
    TableName: string;
  };
};

exports.handler = async (event: AppSyncResolverEvent<QueryUserArgs>) => {
  const result = await user(event.arguments);
  return result;
};

async function user(args: QueryUserArgs) {
  // Write your buisness logic here

  // Example Schema:

  // type User {
  //   id: ID!
  //   name: String!
  //   age: Int!
  // }

  // input userInput {
  //   name: String!
  //   age: Int!
  // }

  // type Query {
  //   listUsers: [User!]
  // }

  // type Mutation {
  //   createUser(user: userInput!): String
  // }

  // Example Code:

  // try{
  // const params = {TableName:process.env.TableName}
  //   const data = await docClient.scan(params).promise()
  // return data.Items
  // }
  // catch (err)  {
  // console.log('ERROR', err)
  // return null
  // }
  return { id: "Maddy", name: "Carly" };
}
