import { appsyncDatasourceHandler, appsyncResolverhandler } from "./functions";
import { CONSTRUCTS, LAMBDASTYLE, Config, ApiModel } from "../../../../utils/constants";
import { Appsync } from "../../constructs/Appsync";
import { Cdk } from "../../constructs/Cdk";
import { Iam } from "../../constructs/Iam";
import { Imports } from "../../constructs/ConstructsImports";
import { CodeMaker } from "codemaker";
import { readFileSync } from "fs";
import * as path from "path";
import { TypeScriptWriter } from "../../../../utils/typescriptWriter";

type StackBuilderProps = {
  config: ApiModel;
};

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
      api: { apiName, lambdaStyle, schema },
    } = this.config;
    const ts = new TypeScriptWriter(this.code);
    this.code.openFile(this.outputFile);
    const appsync = new Appsync(this.code);
    const cdk = new Cdk(this.code);
    const iam = new Iam(this.code);
    const imp = new Imports(this.code);

    const schemaGql = readFileSync(
      path.join(path.resolve("."), `/schema/schema.gql`)
    ).toString("utf8");
    const mutations = schema.type.Mutation ? schema.type.Mutation : {};
    const queries = schema.type.Query ? schema.type.Query : {};
    const mutationsAndQueries = { ...mutations, ...queries };
    imp.importsForStack();
    imp.importAppsync();
    imp.importIam();

    let ConstructProps = [
      {
        name: `${apiName}_lambdaFnArn`,
        type: "string",
      },
    ];

    if (lambdaStyle && lambdaStyle === LAMBDASTYLE.multi) {
      Object.keys(mutationsAndQueries).forEach((key: string, index: number) => {
        ConstructProps[index] = {
          name: `${apiName}_lambdaFn_${key}Arn`,
          type: "string",
        };
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
        appsyncDatasourceHandler(
          apiName,
          lambdaStyle,
          this.code,
          mutationsAndQueries
        );
        this.code.line();
        appsyncResolverhandler(apiName, lambdaStyle, this.code, schema.type);
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
