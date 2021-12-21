var axios = require("axios");

import * as AWS from "aws-sdk";
import { AppSyncResolverEvent } from "aws-lambda";
import { QueryUserArgs } from "../../../types";
import { User } from "../../../types";
import { process as gprocess } from "gremlin";
const initGremlin = require("/opt/utils/gremlin_init");
exports.handler = async (event: AppSyncResolverEvent<QueryUserArgs>) => {
  const { g, conn } = initGremlin.initializeGremlinClient(
    process.env.NEPTUNE_ENDPOINT!
  );

  const result = await user(event.arguments, g);
  return result;
};

async function user(
  args: QueryUserArgs,
  g: gprocess.GraphTraversalSource
): Promise<User> {
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

  // try {
  //   let data = await g.V().hasLabel('user').toList()
  //   let users = Array()

  //   for (const v of data) {
  //     const _properties = await g.V(v.id).properties().toList()
  //     let user = _properties.reduce((acc, next) => {
  //       acc[next.label] = next.value
  //       return acc
  //     }, {})
  //     user.id = v.id
  //     users.push(post)
  //   }
  //   return users
  // } catch (err) {
  //     console.log('ERROR', err)
  //     return null
  // }

  return { id: "Tricia", name: "Anthea" };
}
