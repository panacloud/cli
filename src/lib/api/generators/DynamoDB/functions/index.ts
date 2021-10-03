import { CodeMaker } from "codemaker";
import { LAMBDASTYLE } from "../../../../../utils/constants";
import { DynamoDB } from "../../../constructs/DynamoDB";

export const dynamodbAccessHandler = (
  apiName: string,
  lambdaStyle: string,
  code: CodeMaker,
  mutationsAndQueries: string[]
) => {
  const dynamoDB = new DynamoDB(code);

  if (lambdaStyle === LAMBDASTYLE.single) {
    dynamoDB.grantFullAccess(`${apiName}`, `${apiName}_table`, lambdaStyle);
  } else if (lambdaStyle === LAMBDASTYLE.multi) {
    mutationsAndQueries.forEach((key: string) => {
      dynamoDB.grantFullAccess(
        `${apiName}`,
        `${apiName}_table`,
        lambdaStyle,
        key
      );
      code.line();
    });
  }
};

export const dynamodbPropsHandler = (
  apiName: string,
  lambdaStyle: string,
  code: CodeMaker,
  mutationsAndQueries: string[]
) => {
  if (lambdaStyle && lambdaStyle === LAMBDASTYLE.single) {
    const props = {
      name: `${apiName}_lambdaFn`,
      type: "lambda.Function",
    };
  }

  if (lambdaStyle && lambdaStyle === LAMBDASTYLE.multi) {
    mutationsAndQueries.forEach((key: string) => {
      const props = {
        name: `${apiName}_lambdaFn_${key}`,
        type: "lambda.Function",
      };
      code.line(`${props}`);
    });
  }
};
