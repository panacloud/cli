var axios = require("axios");

import * as AWS from "aws-sdk";
import { AppSyncResolverEvent } from "aws-lambda";
import { MutationDeleteTodoArgs } from "../../../customMockLambdaLayer/mockData/types";
import { process as gprocess } from "gremlin";
const initGremlin = require("/opt/utils/gremlin_init");
exports.handler = async (
  event: AppSyncResolverEvent<MutationDeleteTodoArgs>
) => {
  const { g, conn } = initGremlin.initializeGremlinClient(
    process.env.NEPTUNE_ENDPOINT!
  );

  const result = await deleteTodo(event.arguments, g);
  return result;
};

async function deleteTodo(
  args: MutationDeleteTodoArgs,
  g: gprocess.GraphTraversalSource
) {
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

  //  await g.addV('user').property('name', 'John').property('age', 20)

  // return args.user.name;
  return "Claudia";
}
