import { CodeMaker } from "codemaker";
import { DynamoDB } from "../../../constructs/Dynamodb";

export const dynamodbAccessHandler = (
  apiName: string,
  code: CodeMaker,
  mutationsAndQueries: string[]
) => {
  const dynamoDB = new DynamoDB(code);

  mutationsAndQueries.forEach((key: string) => {
    dynamoDB.grantFullAccess(`${apiName}`, `${apiName}_table`, key);
    code.line();
  });
};

export const dynamodbPropsHandler = (
  apiName: string,
  code: CodeMaker,
  mutationsAndQueries: string[]
) => {
  mutationsAndQueries.forEach((key: string) => {
    const props = {
      name: `${apiName}_lambdaFn_${key}`,
      type: "lambda.Function",
    };
    code.line(`${props}`);
  });
};
