var axios = require("axios");

import * as AWS from "aws-sdk";
import { AppSyncResolverEvent } from "aws-lambda";

exports.handler = async (event: AppSyncResolverEvent<any>) => {
  console.log(JSON.stringify(event, null, 2));
};
