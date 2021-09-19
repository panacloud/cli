import { CodeMaker } from "codemaker";
import { TypeScriptWriter } from "../../../../../utils/typescriptWriter";
import {
  CONSTRUCTS,
  LAMBDASTYLE,
  DATABASE,
  ApiModel,
} from "../../../../../utils/constants";
import { Cdk } from "../../../constructs/Cdk";
import { Imports } from "../../../constructs/ConstructsImports";
import { Iam } from "../../../constructs/Iam";
import { Appsync } from "../../../constructs/Appsync";
import { Lambda } from "../../../constructs/Lambda";

type StackBuilderProps = {
  config: ApiModel;
};

export class AppsyncConstructTest {
  outputFile: string = `${CONSTRUCTS.appsync}.test.ts`;
  outputDir: string = `test`;
  config: ApiModel;
  code: CodeMaker;

  constructor(props: StackBuilderProps) {
    this.config = props.config;
    this.code = new CodeMaker();
  }

  async construcAppsyncConstructTestFile() {
    const ts = new TypeScriptWriter(this.code);
    this.code.openFile(this.outputFile);
    const {
      api: { apiName, lambdaStyle, database, schema },
    } = this.config;
    const iam = new Iam(this.code);
    const appsync = new Appsync(this.code);
    const lambda = new Lambda(this.code);
    const imp = new Imports(this.code);
    const testClass = new Cdk(this.code);
    const mutations = schema.type.Mutation ? schema.type.Mutation : {};
    const queries = schema.type.Query ? schema.type.Query : {};
    const mutationsAndQueries = { ...mutations, ...queries };
    imp.ImportsForTest();

    if (database === DATABASE.dynamoDB) {
      imp.importForAppsyncConstructInTest();
      imp.importForLambdaConstructInTest();
      imp.importForDynamodbConstructInTest();
    } else if (database === DATABASE.neptuneDB) {
      imp.importForAppsyncConstructInTest();
      imp.importForLambdaConstructInTest();
      imp.importForNeptuneConstructInTest();
    } else if (database === DATABASE.auroraDB) {
      imp.importForAppsyncConstructInTest();
      imp.importForLambdaConstructInTest();
      imp.importForAuroraDbConstructInTest();
    }

    this.code.line();
    testClass.initializeTest("Appsync Api Constructs Test", () => {
      appsync.apiName = apiName;

      if (database === DATABASE.dynamoDB) {
        iam.constructorIdentifier(CONSTRUCTS.dynamoDB);
      } else if (database === DATABASE.neptuneDB) {
        iam.constructorIdentifier(CONSTRUCTS.neptuneDB);
      } else if (database === DATABASE.auroraDB) {
        iam.constructorIdentifier(CONSTRUCTS.auroraDB);
      }
      lambda.lambdaTestConstructInitializer(apiName, database, this.code)
      
      appsync.appsyncTestConstructInitializer(
        apiName,
        lambdaStyle,
        database,
        mutationsAndQueries,
        this.code
      );
      this.code.line();
      iam.appsyncApiTestIdentifier();
      this.code.line();
      appsync.appsyncApiTest();
      this.code.line();
      appsync.appsyncApiKeyTest();
      this.code.line();
      iam.appsyncRoleTestIdentifier();
      this.code.line();
      iam.appsyncServiceRoleTest();
      this.code.line();
      iam.appsyncRolePolicyTest();
      this.code.line();
      iam.lambdaConsturctIdentifier();
      this.code.line();
      iam.lambdaIdentifier();
      this.code.line();

      if (lambdaStyle === LAMBDASTYLE.single) {
        let dsName = `${apiName}_dataSource`;
        appsync.appsyncDatasourceTest(dsName, 0);
      } else if (lambdaStyle === LAMBDASTYLE.multi && mutationsAndQueries) {
        Object.keys(mutationsAndQueries).forEach((key, index) => {
          if (lambdaStyle === LAMBDASTYLE.multi) {
            let dsName = `${apiName}_dataSource_${key}`;
            appsync.appsyncDatasourceTest(dsName, index);
            this.code.line();
          }
        });
      }
      this.code.line();

      if (schema.type?.Query) {
        for (var key in schema.type?.Query) {
          if (lambdaStyle === LAMBDASTYLE.single) {
            appsync.appsyncResolverTest(key, "Query", `${apiName}_dataSource`);
          }
          if (lambdaStyle === LAMBDASTYLE.multi) {
            appsync.appsyncResolverTest(
              key,
              "Query",
              `${apiName}_dataSource_${key}`
            );
            this.code.line();
          }
        }
      }
      this.code.line();

      if (schema.type?.Mutation) {
        for (var key in schema.type?.Mutation) {
          if (lambdaStyle === LAMBDASTYLE.single) {
            appsync.appsyncResolverTest(
              key,
              "Mutation",
              `${apiName}_dataSource`
            );
            this.code.line();
          }
          if (lambdaStyle === LAMBDASTYLE.multi) {
            appsync.appsyncResolverTest(
              key,
              "Mutation",
              `${apiName}_dataSource_${key}`
            );
            this.code.line();
          }
        }
      }
    });

    this.code.closeFile(this.outputFile);
    await this.code.save(this.outputDir);
  }
}

export const appsyncConstructTest = async (
  props: StackBuilderProps
): Promise<void> => {
  const builder = new AppsyncConstructTest(props);
  await builder.construcAppsyncConstructTestFile();
};
