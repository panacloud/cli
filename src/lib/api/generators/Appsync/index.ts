import { appsyncDatasourceHandler, appsyncResolverhandler } from "./functions";
import { CONSTRUCTS, ApiModel } from "../../../../utils/constants";
import { Appsync } from "../../constructs/Appsync";
import { Cdk } from "../../constructs/Cdk";
import { Iam } from "../../constructs/Iam";
import { Imports } from "../../constructs/ConstructsImports";
import { CodeMaker } from "codemaker";
import { readFileSync } from "fs";
import * as path from "path";

type StackBuilderProps = {
  config: ApiModel;
};
interface ConstructPropsType {
  name: string;
  type: string;
}

class AppsyncConstruct {
  outputFile: string = `index.ts`;
  outputDir: string = `lib/${CONSTRUCTS.appsync}`;
  config: ApiModel;
  code: CodeMaker;
  constructor(props: StackBuilderProps) {
    this.config = props.config;
    this.code = new CodeMaker();
  }

  async AppsyncConstructFile() {
    const {
      api: { apiName, schemaPath, queiresFields, mutationFields,nestedResolver,schemaTypes,nestedResolverTypes },
    } = this.config;
    this.code.openFile(this.outputFile);
    const appsync = new Appsync(this.code);
    const cdk = new Cdk(this.code);
    const iam = new Iam(this.code);
    const imp = new Imports(this.code);
    const schemaGql = readFileSync(path.resolve(schemaPath)).toString("utf8");
    const mutationsAndQueries: string[] = [
      ...queiresFields!,
      ...mutationFields!,
    ];

    imp.importAppsync();
    imp.importIam();

    let ConstructProps: ConstructPropsType[] = [];

    mutationsAndQueries.forEach((key: string, index: number) => {
      ConstructProps.push({
        name: `${apiName}_lambdaFn_${key}Arn`,
        type: "string",
      })
    });

    if(nestedResolver){
      schemaTypes?.forEach((key: string, index: number) => {
        ConstructProps.push({
          name: `${apiName}_lambdaFn_${key}Arn`,
          type: "string",
        })
      }); 
    }

    cdk.initializeConstruct(
      `${CONSTRUCTS.appsync}`,
      "AppsyncProps",
      () => {
        this.code.line();
        appsync.initializeAppsyncApi(apiName);
        this.code.line();
        appsync.initializeAppsyncSchema(schemaGql);
        this.code.line();
        appsync.initializeApiKeyForAppsync(apiName);
        this.code.line();
        iam.serviceRoleForAppsync(apiName);
        this.code.line();
        iam.attachLambdaPolicyToRole(`${apiName}`);
        this.code.line();
        appsyncDatasourceHandler(this.config, this.code);
        this.code.line();
        appsyncResolverhandler(this.config, this.code);
      },
      ConstructProps
    );
    this.code.closeFile(this.outputFile);
    await this.code.save(this.outputDir);
  }
}

export const AppsyncApiConstruct = async (
  props: StackBuilderProps
): Promise<void> => {
  const builder = new AppsyncConstruct(props);
  await builder.AppsyncConstructFile();
};
