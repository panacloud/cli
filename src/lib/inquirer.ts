import {
  APITYPE,
  DATABASE,
  CLOUDPROVIDER,
  LANGUAGE,
  SAASTYPE,
  NEPTUNEQUERYLANGUAGE,
} from "../utils/constants";
import { fileExistsAsync } from "./fs";
const inquirer = require("inquirer");

export const userInput = async () => {
  return await inquirer.prompt([
    // {
    //   type: "list",
    //   name: "cloud_provider",
    //   message: "Your Cloud Provider?",
    //   choices: [CLOUDPROVIDER.aws],
    //   default: CLOUDPROVIDER.aws,
    //   validate: Boolean,
    // },
    // {
    //   type: "list",
    //   name: "language",
    //   message: "Your Language?",
    //   choices: [LANGUAGE.typescript],
    //   default: LANGUAGE.typescript,
    //   validate: Boolean,
    // },
    // {
    //   type: "list",
    //   name: "saas_type",
    //   message: "Select SaaS Type?",
    //   choices: [SAASTYPE.api],
    //   default: SAASTYPE.api,
    //   validate: Boolean,
    // },
    // {
    //   type: "string",
    //   name: "entityId",
    //   message: "Enter Your Panacloud Portal User ID",
    //   validate: Boolean,
    // },
    // {
    //   type: "string",
    //   name: "api_token",
    //   message: "Enter Your Panacloud Portal API Key",
    //   validate: Boolean,
    // },
    // {
    //   type: "list",
    //   name: "api_type",
    //   message: "Select API Type?",
    //   choices: [APITYPE.graphql, APITYPE.rest],
    //   default: APITYPE.graphql,
    //   when: (answers: any) =>
    //     answers.template === TEMPLATE.defineApi,
    //   validate: Boolean,
    // },
    {
      type: "string",
      name: "schema_path",
      message: "GraphQL Schema File Path",
      // when: (answers: any) =>
      //   answers.api_type === APITYPE.graphql,
      validate: (val: string) => fileExistsAsync(val),
    },
    // {
    //   type: "string",
    //   name: "schema_path",
    //   message: "REST OpenAPI Specifications File Path",
    //   when: (answers: any) =>
    //     answers.api_type === APITYPE.rest,
    //   validate: (val: string) => fileExistsAsync(val),
    // },
    {
      type: "string",
      name: "api_name",
      message: "API Name",
      default: "MyApi",
      validate: Boolean,
    },
    {
      type: "confirm",
      name: "nestedResolver",
      message: "Nested Resolver",
      validate: Boolean,
      when: (answers: any) => answers.api_type === APITYPE.graphql,
    },
    // {
    //   type: "list",
    //   name: "database",
    //   message: "Select Database?",
    //   choices: [
    //     DATABASE.dynamoDB,
    //     DATABASE.neptuneDB,
    //     DATABASE.auroraDB,
    //     DATABASE.none,
    //   ],
    //   default: DATABASE.auroraDB,
    //   when: (answers: any) => answers.template === TEMPLATE.defineApi,
    //   validate: Boolean,
    // },
    {
      type: "list",
      name: "neptuneQueryLanguage",
      message: "Select Query Language",
      choices: [NEPTUNEQUERYLANGUAGE.gremlin, NEPTUNEQUERYLANGUAGE.cypher],
      default: NEPTUNEQUERYLANGUAGE.gremlin,
      validate: Boolean,
    },
  ]);
};

export const mergeInputs = async () => {
  return await inquirer.prompt([
    {
      type: "list",
      name: "api_type",
      message: "Select API Type?",
      choices: [APITYPE.graphql],
      default: APITYPE.graphql,
      validate: Boolean,
    },
    {
      type: "string",
      name: "schema",
      message: "Schema Files Path (Glob Path)",
      validate: Boolean,
    },
    {
      type: "string",
      name: "output",
      message: "Output File Name",
      validate: Boolean,
    },
  ]);
};
