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
  const result = await deleteToDos();
  return result;
};

async function deleteToDos() {
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
  // const params = {TableName:process.env.TableName, Item: args.user}
  // await docClient.put(params).promise()
  //return args.user.name
  // }
  // catch (err)  {
  // console.log('ERROR', err)
  // return null
  // }
  return [
    { id: "01", title: "Rosalinde", description: "Latia" },
    { id: "01", title: "Jeannie", description: "Kristal" },
    { id: "01", title: "Corry", description: "Fallon" },
  ];
}
