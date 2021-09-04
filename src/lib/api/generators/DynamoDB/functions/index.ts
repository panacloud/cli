import { CodeMaker } from "codemaker";
import { LAMBDASTYLE } from "../../../../../utils/constants";
import { DynamoDB } from "../../../constructs/DynamoDB";
let maker = new CodeMaker();

export const dynamodbAccessHandler = (
  apiName: string,
  lambdaStyle: string,
  mutationsAndQueries: any
) => {
  const dynamoDB = new DynamoDB();

  if (lambdaStyle === LAMBDASTYLE.single) {
    dynamoDB.grantFullAccess(`${apiName}`, `${apiName}_table`, lambdaStyle);
  } else if (lambdaStyle === LAMBDASTYLE.multi) {
    Object.keys(mutationsAndQueries).forEach((key) => {
      dynamoDB.grantFullAccess(
        `${apiName}`,
        `${apiName}_table`,
        lambdaStyle,
        key
      );
      maker.line();
    });
  }
};

export const dynamodbPropsHandler = (
  apiName: string,
  lambdaStyle: string,
  mutationsAndQueries: any
) => {
  if (lambdaStyle && lambdaStyle === LAMBDASTYLE.single) {
    const props = {
      name: `${apiName}_lambdaFn`,
      type: "lambda.Function",
    };
  }

  if (lambdaStyle && lambdaStyle === LAMBDASTYLE.multi) {
    Object.keys(mutationsAndQueries).forEach((key, index) => {
      const props = {
        name: `${apiName}_lambdaFn_${key}`,
        type: "lambda.Function",
      };
      maker.line(`${props}`);
    });
  }
};
