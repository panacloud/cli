import { CodeMaker } from "codemaker";
import { TypeScriptWriter } from "../../../../../utils/typescriptWriter";
import {
  CONSTRUCTS,
  Config,
  LAMBDASTYLE,
  DATABASE,
} from "../../../../../utils/constants";
import { Cdk } from "../../../constructs/Cdk";
import { Imports } from "../../../constructs/ConstructsImports";
import { Iam } from "../../../constructs/Iam";
import { Appsync } from "../../../constructs/Appsync";

type StackBuilderProps = {
    config: Config;
    schema: any
  };
  
  export class AppsyncConstructTest {
    outputFile: string = `${CONSTRUCTS.appsync}.test.ts`;
    outputDir: string = `test`;
    config: Config;
    jsonSchema: any;
    code: CodeMaker;
  
    constructor(props: StackBuilderProps) {
      this.config = props.config;
      this.code = new CodeMaker();
      this.jsonSchema = props.schema
    }
  
    async construcAppsyncConstructTestFile() {
      const ts = new TypeScriptWriter(this.code);
      this.code.openFile(this.outputFile);
      const {api:{apiName,lambdaStyle,database}} = this.config
      const iam = new Iam(this.code);
      const appsync = new Appsync(this.code);
      const imp = new Imports(this.code);
      const testClass = new Cdk(this.code);
      const mutations = this.jsonSchema.Mutation ? this.jsonSchema.Mutation : {};
      const queries = this.jsonSchema.Query ? this.jsonSchema.Query : {};
      const mutationsAndQueries = { ...mutations, ...queries };
      imp.ImportsForTest();

      if (database === DATABASE.dynamo) {
        imp.importForAppsyncConstructInTest();
        imp.importForLambdaConstructInTest();
        imp.importForDynamodbConstructInTest()
      } else if(database === DATABASE.neptune) {
        imp.importForAppsyncConstructInTest();
        imp.importForLambdaConstructInTest();
        imp.importForNeptuneConstructInTest()
      } else if (database === DATABASE.aurora) {
        imp.importForAppsyncConstructInTest();
        imp.importForLambdaConstructInTest();
        imp.importForAuroraDbConstructInTest()     
       }

      this.code.line()
      testClass.initializeTest(
        "Appsync Api Constructs Test",
        () => {
          appsync.apiName = apiName;
          if (database === DATABASE.dynamo) {
            iam.constructorIdentifier(CONSTRUCTS.dynamodb)
            iam.LambdaConstructIdentifierForDbb()
          } else if(database === DATABASE.neptune) {
            iam.constructorIdentifier(CONSTRUCTS.neptuneDb);
            iam.LambdaConstructIdentifierForNeptunedb()
          } else if (database === DATABASE.aurora) {
            iam.constructorIdentifier(CONSTRUCTS.auroradb);
            iam.LambdaConstructIdentifierForAuroradb()
          }
          iam.appsyncDatabasePropsHandler(apiName, lambdaStyle, database, mutationsAndQueries, this.code );
          this.code.line();
          iam.appsyncApiTestIdentifier()
          this.code.line()
          appsync.appsyncApiTest();
          this.code.line();
          appsync.appsyncApiKeyTest();
          this.code.line();
          iam.appsyncRoleTestIdentifier()
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

          if (this.jsonSchema?.Query) {
            for (var key in this.jsonSchema?.Query) {
              if (lambdaStyle === LAMBDASTYLE.single) {
                appsync.appsyncResolverTest(
                  key,
                  "Query",
                  `${apiName}_dataSource`
                );
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

          if (this.jsonSchema?.Mutation) {
            for (var key in this.jsonSchema?.Mutation) {
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
        },
      );

      this.code.closeFile(this.outputFile);
      await this.code.save(this.outputDir);
    }
};
    
export const appsyncConstructTest = async (
    props: StackBuilderProps
  ): Promise<void> => {
    const builder = new AppsyncConstructTest(props);
    await builder.construcAppsyncConstructTestFile();
  };
  
        
  