import { TestCollection } from "../../lambdaLayer/mockApi/user/testCollectionsTypes";
var data = require("/opt/mockApi/user/testCollections") as {
  testCollections: TestCollection;
};

import * as AWS from "aws-sdk";
import { AppSyncResolverEvent } from "aws-lambda";
var isEqual = require("lodash.isequal");

exports.handler = async (event: AppSyncResolverEvent<any>) => {
  let response = {};
  data.testCollections.fields.user.forEach((v: any) => {
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
