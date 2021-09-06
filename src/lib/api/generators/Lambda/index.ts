
import { CONSTRUCTS,Config, APITYPE, DATABASE } from "../../../../utils/constants";
import { Cdk } from "../../constructs/Cdk";
import { Imports } from "../../constructs/ConstructsImports";
import { CodeMaker } from "codemaker";
import { Property } from "../../../../utils/typescriptWriter";
import { lambdaHandlerForAuroradb, lambdaHandlerForDynamodb, lambdaHandlerForNeptunedb, lambdaProperiesHandlerForAuroraDb, lambdaProperiesHandlerForDynoDb, lambdaProperiesHandlerForNeptuneDb, lambdaPropsHandlerForAuroradb, lambdaPropsHandlerForNeptunedb } from "./functions";

type StackBuilderProps = {
    config: Config;
    schema: any
};

class AppsyncConstruct {
    outputFile: string = `index.ts`;
    outputDir: string = `lib/${CONSTRUCTS.lambda}`;
    config: Config;
    jsonSchema: any
    code: CodeMaker;
    constructor(props: StackBuilderProps) {
      this.config = props.config;
      this.code = new CodeMaker();
      this.jsonSchema = props.schema
    }

    async LambdaConstructFile() {
      const {api:{apiName,lambdaStyle, apiType, database}} = this.config
    let mutations = {};
    let queries = {};
    if (apiType === APITYPE.graphql) {
      mutations = this.jsonSchema.Mutation ? this.jsonSchema.Mutation : {};
      queries = this.jsonSchema.Query ? this.jsonSchema.Query : {};
    }
    const mutationsAndQueries = { ...mutations, ...queries };

    let lambdaPropsWithName: string | undefined;
    let lambdaProps: { name: string; type: string }[] | undefined;
    let lambdaProperties: Property[] | undefined;

    const cdk = new Cdk(this.code);
    const imp = new Imports(this.code);

    imp.importsForStack();
    imp.importEc2();
    imp.importLambda();
    imp.importIam();

    if (database === DATABASE.dynamo) {
      lambdaProps = [
        {
          name: "tableName",
          type: "string",
        },
      ];
      lambdaPropsWithName = "handlerProps";
      lambdaProperties = lambdaProperiesHandlerForDynoDb(
        lambdaStyle,
        apiName,
        apiType,
        mutationsAndQueries
      );
    }
    if (database === DATABASE.neptune) {
      lambdaPropsWithName = "handlerProps";
      lambdaProps = lambdaPropsHandlerForNeptunedb();
      lambdaProperties = lambdaProperiesHandlerForNeptuneDb(
        apiName,
        apiType,
        lambdaStyle,
        database,
        mutationsAndQueries
      );
    }
    if (database === DATABASE.aurora) {
      lambdaPropsWithName = "handlerProps";
      lambdaProps = lambdaPropsHandlerForAuroradb();
      lambdaProperties = lambdaProperiesHandlerForAuroraDb(
        apiName,
        apiType,
        lambdaStyle,
        database,
        mutationsAndQueries
      );
    }
    cdk.initializeConstruct(
      CONSTRUCTS.lambda,
      lambdaPropsWithName,
      () => {
        if (database === DATABASE.dynamo) {
          lambdaHandlerForDynamodb(
              this.code,
            apiName,
            apiType,
            lambdaStyle,
            database,
            mutationsAndQueries
          );
        }
        if (database === DATABASE.neptune) {
          lambdaHandlerForNeptunedb(
            this.code,
            lambdaStyle,
            database,
            apiType,
            apiName,
            mutationsAndQueries
          );
        }
        if (database === DATABASE.aurora) {
          lambdaHandlerForAuroradb(
            this.code,
            lambdaStyle,
            database,
            apiType,
            apiName,
            mutationsAndQueries
          );
        }
      },
      lambdaProps,
      lambdaProperties
    );
        this.code.closeFile(this.outputFile);
        await this.code.save(this.outputDir);
    }
}

export const LambdaConstruct = async (
    props: StackBuilderProps
  ): Promise<void> => {
    const builder = new AppsyncConstruct(props);
    await builder.LambdaConstructFile();
  };
  