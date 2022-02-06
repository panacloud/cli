var axios = require("axios");
import * as AWS from "aws-sdk";
import { AppSyncResolverEvent } from "aws-lambda";
const db = require("data-api-client")({
  secretArn: process.env.SECRET_ARN,
  resourceArn: process.env.CLUSTER_ARN,
  database: process.env.DB_NAME,
});
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
  // const query = `SELECT * FROM users`;
  // const data = await db.query(query)
  // return data
  // }
  // catch (err)  {
  // console.log('ERROR', err)
  // return null
  // }
  return [
    { id: "01", title: "Freida", description: "Sukey" },
    { id: "01", title: "Mathilde", description: "Marena" },
    { id: "01", title: "Coralyn", description: "Britteny" },
  ];
}
