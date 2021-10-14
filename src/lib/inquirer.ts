import {
  TEMPLATE,
  APITYPE,
  DATABASE,
  CLOUDPROVIDER,
  LANGUAGE,
  SAASTYPE,
  ARCHITECTURE,
} from "../utils/constants";
import { fileExistsAsync } from "./fs";
const inquirer = require("inquirer");

export const userInput = async () => {
  return await inquirer.prompt([
    {
      type: "list",
      name: "cloud_provider",
      message: "Your Cloud Provider?",
      choices: [CLOUDPROVIDER.aws],
      default: CLOUDPROVIDER.aws,
      validate: Boolean,
    },
    {
      type: "list",
      name: "language",
      message: "Your Language?",
      choices: [LANGUAGE.typescript],
      default: LANGUAGE.typescript,
      validate: Boolean,
    },
    {
      type: "list",
      name: "saas_type",
      message: "Select SaaS Type?",
      choices: [SAASTYPE.api],
      default: SAASTYPE.api,
      validate: Boolean,
    },
    {
      type: "list",
      name: "template",
      message: "Which Kind of Mutli-Tenant Serverless API?",
      choices: [TEMPLATE.basicApi, TEMPLATE.todoApi, TEMPLATE.defineApi],
      default: TEMPLATE.basicApi,
      validate: Boolean,
    },
    {
      type: "list",
      name: "architecture",
      message: "Select architecture type?",
      choices: [ARCHITECTURE.requestDriven, ARCHITECTURE.eventDriven],
      default: ARCHITECTURE.requestDriven,
      when: (answers: any) => answers.template === TEMPLATE.defineApi,
      validate: Boolean,
    },
    {
      type: "string",
      name: "entityId",
      message: "Enter Your Panacloud Portal User ID",
      validate: Boolean,
    },
    {
      type: "string",
      name: "api_token",
      message: "Enter Your Panacloud Portal API Key",
      validate: Boolean,
    },
    {
      type: "list",
      name: "api_type",
      message: "Select API Type?",
      choices: [APITYPE.graphql, APITYPE.rest],
      default: APITYPE.graphql,
      when: (answers: any) => answers.template === TEMPLATE.defineApi,
      validate: Boolean,
    },
    {
      type: "string",
      name: "schema_path",
      message: "GraphQL Schema File Path",
      when: (answers: any) => answers.api_type === APITYPE.graphql,
      validate: (val: string) => fileExistsAsync(val),
    },
    {
      type: "string",
      name: "schema_path",
      message: "REST OpenAPI Specifications File Path",
      when: (answers: any) => answers.api_type === APITYPE.rest,
      validate: (val: string) => fileExistsAsync(val),
    },
    {
      type: "string",
      name: "api_name",
      message: "API Name",
      default: "myApi",
      when: (answers: any) => answers.template === TEMPLATE.defineApi,
      validate: Boolean,
    },
    // {
    //   type: "confirm",
    //   name: "nestedResolver",
    //   message: "Nested Resolver",
    //   validate: Boolean,
    //   when: (answers: any) =>
    //     answers.template === TEMPLATE.defineApi ||
    //     answers.api_type === APITYPE.graphql,
    // },
    {
      type: "list",
      name: "database",
      message: "Select Database?",
      choices: [
        DATABASE.dynamoDB,
        DATABASE.neptuneDB,
        DATABASE.auroraDB,
        DATABASE.none,
      ],
      default: DATABASE.auroraDB,
      when: (answers: any) => answers.template === TEMPLATE.defineApi,
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
