import { APITYPE } from "../../utils/constants";
import { stopSpinner } from "../spinner";
const fs = require("fs");
const path = require("path");

export const checkEmptyDirectoy = (spinner: any) => {
  const fileCount = fs.readdirSync(process.cwd()).length;
  if (fileCount >= 1) {
    fs.readdirSync(process.cwd()).forEach((file: string) => {
      console.log("file ", file);
      if (
        path.extname(file) !== ".gql" &&
        path.extname(file) !== ".graphql" &&
        path.extname(file) !== ".json" &&
        path.extname(file) !== ".yml" &&
        path.extname(file) !== ".yaml" &&
        file !== ".git"
      ) {
        stopSpinner(spinner, "Error: directory not empty", true);
        process.exit(1);
      }
    });
  }
};

export const validateSchemaFile = (
  file: string,
  spinner: any,
  apiType: APITYPE
) => {
  if (apiType === APITYPE.graphql) {
    if (path.extname(file) !== ".gql" && path.extname(file) !== ".graphql") {
      stopSpinner(spinner, `Error: GraphQL Schema not found`, true);
      process.exit(1);
    } else {
      const graphQlFileData = fs.readFileSync(file).toString("utf8");
      if (graphQlFileData.length == 0) {
        stopSpinner(spinner, "Error: File can not be empty", true);
        process.exit(1);
      }
    }
  } else {
    if (
      path.extname(file) !== ".json" &&
      path.extname(file) !== ".yml" &&
      path.extname(file) !== ".yaml"
    ) {
      stopSpinner(
        spinner,
        `Error: REST OpenAPI Specifications not found`,
        true
      );
      process.exit(1);
    } else {
      const OpenApiFileData = fs.readFileSync(file).toString("utf8");
      if (OpenApiFileData.length == 0) {
        stopSpinner(spinner, "Error: File can not be empty", true);
        process.exit(1);
      }
    }
  }
};
