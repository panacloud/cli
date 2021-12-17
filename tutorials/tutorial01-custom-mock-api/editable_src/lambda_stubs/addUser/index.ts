var axios = require("axios");

import * as AWS from "aws-sdk";
import { AppSyncResolverEvent } from "aws-lambda";
import { MutationAddUserArgs } from "../../customMockLambdaLayer/mockData/types";
const initGremlin = require("/opt/utils/gremlin_init");
exports.handler = async (event: AppSyncResolverEvent<MutationAddUserArgs>) => {
  const { g, conn } = initGremlin.initializeGremlinClient(
    process.env.NEPTUNE_ENDPOINT!
  );

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

  //  await g.addV('user').property('name', 'John').property('age', 20)

  // return user.name;
  console.log(JSON.stringify(event, null, 2));
};
