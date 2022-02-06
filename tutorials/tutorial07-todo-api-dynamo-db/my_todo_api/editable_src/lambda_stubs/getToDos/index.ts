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
  return [
    { id: "01", title: "Adena", description: "Lanna" },
    { id: "01", title: "Alisha", description: "Nannette" },
    { id: "01", title: "Susi", description: "Xylia" },
  ];
}
