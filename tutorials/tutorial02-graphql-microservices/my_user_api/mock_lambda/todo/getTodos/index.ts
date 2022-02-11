import { TestCollection } from "../../../mock_lambda_layer/mockData/getTodos/testCollectionsTypes";
var data = require("/opt/mockData/getTodos/testCollections") as {
  testCollections: TestCollection;
};

import * as AWS from "aws-sdk";
import { AppSyncResolverEvent } from "aws-lambda";
var isEqual = require("lodash.isequal");

exports.handler = async (event: AppSyncResolverEvent<any>) => {
  let response = {};
  data.testCollections.fields.getTodos.forEach((v: any) => {
    if (v.arguments) {
      let equal = isEqual(v.arguments, event.arguments);
      if (equal) {
        response = v.response;
      }
    } else {
      response = v.response;
    }
  });

  return response;
};
