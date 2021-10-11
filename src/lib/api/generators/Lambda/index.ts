import {
  CONSTRUCTS,
  APITYPE,
  DATABASE,
  ApiModel,
  PanacloudconfigFile
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
  lambdaProperiesHandlerForMockApi,
  lambdaProperiesHandlerForNeptuneDb,
  lambdaPropsHandlerForAuroradb,
  lambdaPropsHandlerForNeptunedb,
} from "./functions";
import { Lambda } from "../../constructs/Lambda";

type StackBuilderProps = {
  config: ApiModel;
  panacloudConfig: PanacloudconfigFile
};

class lambdaConstruct {
  outputFile: string = `index.ts`;
  outputDir: string = `lib/${CONSTRUCTS.lambda}`;
  config: ApiModel;
  panacloudConfig: PanacloudconfigFile;
  code: CodeMaker;
  constructor(props: StackBuilderProps) {
    this.config = props.config;
    this.panacloudConfig = props.panacloudConfig;
    this.code = new CodeMaker();
  }

  async LambdaConstructFile() {
    const {
      api: { apiName, apiType, database },
    } = this.config;
    let mutationsAndQueries: string[] = [];
    if (apiType === APITYPE.graphql) {
      const { queiresFields, mutationFields } = this.config.api;
      mutationsAndQueries = [...queiresFields!, ...mutationFields!];
    }
    let lambdaPropsWithName: string | undefined;
    let lambdaProps: { name: string; type: string }[] | undefined;
    let lambdaProperties: Property[] | undefined;
    this.code.openFile(this.outputFile);
    const cdk = new Cdk(this.code);
    const imp = new Imports(this.code);
    const lambda = new Lambda(this.code, this.panacloudConfig);
    imp.importLambda();

    if (!database) {
      lambdaProperties = lambdaProperiesHandlerForMockApi(
        apiName,
        apiType,
        mutationsAndQueries
      );
    }
    if (database === DATABASE.dynamoDB) {
      lambdaProps = [
        {
          name: "tableName",
          type: "string",
        },
      ];
      lambdaPropsWithName = "handlerProps";
      lambdaProperties = lambdaProperiesHandlerForDynoDb(
        apiName,
        apiType,
        mutationsAndQueries
      );
    }
    else if (database === DATABASE.neptuneDB) {
      imp.importEc2();
      lambdaPropsWithName = "handlerProps";
      lambdaProps = lambdaPropsHandlerForNeptunedb();
      lambdaProperties = lambdaProperiesHandlerForNeptuneDb(
        apiName,
        apiType,
        mutationsAndQueries
      );
    }
    else if (database === DATABASE.auroraDB) {
      imp.importEc2();
      imp.importIam();
      lambdaPropsWithName = "handlerProps";
      lambdaProps = lambdaPropsHandlerForAuroradb();
      lambdaProperties = lambdaProperiesHandlerForAuroraDb(
        apiName,
        apiType,
        mutationsAndQueries
      );
    }
    cdk.initializeConstruct(
      CONSTRUCTS.lambda,
      lambdaPropsWithName,
      () => {
        if (!database) {
          lambda.lambdaLayer(apiName);
          mutationsAndQueries.forEach((key: string) => {
            lambda.initializeLambda(apiName , key);
            this.code.line();
            this.code.line(
              `this.${apiName}_lambdaFn_${key}Arn = ${apiName}_lambdaFn_${key}.functionArn`
            );
            this.code.line();
          });
        }
        if (database === DATABASE.dynamoDB) {
          lambdaHandlerForDynamodb(
            this.code,
            this.panacloudConfig,
            apiName,
            apiType,
            mutationsAndQueries,
          );
        }
        else if (database === DATABASE.neptuneDB) {
          lambdaHandlerForNeptunedb(
            this.code,
            this.panacloudConfig,
            apiType,
            apiName,
            mutationsAndQueries,
          );
        }
        else if (database === DATABASE.auroraDB) {
          lambdaHandlerForAuroradb(
            this.code,
            this.panacloudConfig,
            apiType,
            apiName,
            mutationsAndQueries,
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
