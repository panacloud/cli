import {
  CONSTRUCTS,
  APITYPE,
  DATABASE,
  ApiModel,
} from "../../../../utils/constants";
import { Cdk } from "../../constructs/Cdk";
import { Imports } from "../../constructs/ConstructsImports";
import { CodeMaker } from "codemaker";
import { Property } from "../../../../utils/typescriptWriter";
import {
  lambdaHandlerForAuroradb,
  lambdaHandlerForDynamodb,
  lambdaHandlerForNeptunedb,
  lambdaProperiesHandlerForAuroraDb,
  lambdaProperiesHandlerForDynoDb,
  lambdaProperiesHandlerForNeptuneDb,
  lambdaPropsHandlerForAuroradb,
  lambdaPropsHandlerForNeptunedb,
} from "./functions";

type StackBuilderProps = {
  config: ApiModel;
};

class lambdaConstruct {
  outputFile: string = `index.ts`;
  outputDir: string = `lib/${CONSTRUCTS.lambda}`;
  config: ApiModel;
  code: CodeMaker;
  constructor(props: StackBuilderProps) {
    this.config = props.config;
    this.code = new CodeMaker();
  }

  async LambdaConstructFile() {
    const {
      api: { apiName, lambdaStyle, apiType, database, schema },
    } = this.config;
    let mutations = {};
    let queries = {};
    if (apiType === APITYPE.graphql) {
      mutations = schema.type.Mutation ? schema.type.Mutation : {};
      queries = schema.type.Query ? schema.type.Query : {};
    }
    const mutationsAndQueries = { ...mutations, ...queries };

    let lambdaPropsWithName: string | undefined;
    let lambdaProps: { name: string; type: string }[] | undefined;
    let lambdaProperties: Property[] | undefined;
    this.code.openFile(this.outputFile);
    const cdk = new Cdk(this.code);
    const imp = new Imports(this.code);

    imp.importsForStack();
    imp.importEc2();
    imp.importLambda();
    imp.importIam();

    if (database === DATABASE.dynamoDB) {
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
    if (database === DATABASE.neptuneDB) {
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
    if (database === DATABASE.auroraDB) {
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
        if (database === DATABASE.dynamoDB) {
          lambdaHandlerForDynamodb(
            this.code,
            apiName,
            apiType,
            lambdaStyle,
            database,
            mutationsAndQueries
          );
        }
        if (database === DATABASE.neptuneDB) {
          lambdaHandlerForNeptunedb(
            this.code,
            lambdaStyle,
            database,
            apiType,
            apiName,
            mutationsAndQueries
          );
        }
        if (database === DATABASE.auroraDB) {
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
  const builder = new lambdaConstruct(props);
  await builder.LambdaConstructFile();
};
