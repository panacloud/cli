import { CodeMaker } from "codemaker";
import { TypeScriptWriter } from "../../../../utils/typescriptWriter";
import { ApiModel, APITYPE } from "../../../../utils/constants";
import { Imports } from "../../constructs/ConstructsImports";
import { LambdaFunction } from "../../constructs/Lambda/lambdaFunction";
const _ = require("lodash");
const SwaggerParser = require("@apidevtools/swagger-parser");
const fs = require("fs");

type StackBuilderProps = {
  config: ApiModel;
};

class PanacloudConfig {
  config: ApiModel;
  code: CodeMaker;
  constructor(props: StackBuilderProps) {
    this.config = props.config;
    this.code = new CodeMaker();
  }

  async PanacloudConfigFile() {
    const {
      api: { lambdaStyle, apiType, mockApi },
    } = this.config;

    if (apiType === APITYPE.graphql) {
      const {
        api: { queiresFields, mutationFields },
      } = this.config;
      let mutationsAndQueries: string[] = [
        ...queiresFields!,
        ...mutationFields!,
      ];

      let configJson: any = {}
      mutationsAndQueries.forEach(async (key: string) => {
       
        configJson[key] = `lambda/${key}/index.ts`

      });

      await fs.writeFileSync(
        `./custom_src/panacloudConfig.json`,
        JSON.stringify(configJson),
      );

   
    }
  }
}

export const panacloudConfig = async (
  props: StackBuilderProps
): Promise<void> => {
  const builder = new PanacloudConfig(props);
  await builder.PanacloudConfigFile();
};
