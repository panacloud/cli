import { CodeMaker } from "codemaker";
import {CONSTRUCTS,LAMBDASTYLE, DATABASE,ApiModel} from "../../../../../utils/constants";
import { Cdk } from "../../../constructs/Cdk";
import { Imports } from "../../../constructs/ConstructsImports";
import { Iam } from "../../../constructs/Iam";
import { Appsync } from "../../../constructs/Appsync";
import { Lambda } from "../../../constructs/Lambda";

type StackBuilderProps = {
  config: ApiModel;
};
export class AppsyncApiConstructTest {
  outputFile: string = `${CONSTRUCTS.appsync}.test.ts`;
  outputDir: string = `test`;
  config: ApiModel;
  code: CodeMaker;

  constructor(props: StackBuilderProps) {
    this.config = props.config;
    this.code = new CodeMaker();
  }

  async AppsyncConstructTestFile() {
    this.code.openFile(this.outputFile);
    const {api: { apiName, lambdaStyle, database, schema,queiresFields,mutationFields }} = this.config;
    const iam = new Iam(this.code);
    const appsync = new Appsync(this.code);
    const lambda = new Lambda(this.code);
    const imp = new Imports(this.code);
    const testClass = new Cdk(this.code);
    const mutationsAndQueries = [...queiresFields!,...mutationFields!];
    imp.ImportsForTest();
    imp.importForAppsyncConstructInTest();
    imp.importForLambdaConstructInTest();
    if (database === DATABASE.dynamoDB) {
      imp.importForDynamodbConstructInTest();
    } else if (database === DATABASE.neptuneDB) {
      imp.importForNeptuneConstructInTest();
    } else if (database === DATABASE.auroraDB) {
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
      appsync.appsyncTestConstructInitializer(apiName,lambdaStyle,database,mutationsAndQueries);
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
        this.code.line();
      } else if (lambdaStyle === LAMBDASTYLE.multi && mutationsAndQueries) {
        mutationsAndQueries.forEach((key, index) => {
          if (lambdaStyle === LAMBDASTYLE.multi) {
            let dsName = `${apiName}_dataSource_${key}`;
            appsync.appsyncDatasourceTest(dsName, index);
            this.code.line();
          }
        });
      }

      queiresFields?.forEach((key)=>{
        if(lambdaStyle){
          let dsName = `${apiName}_dataSource`
          if(lambdaStyle === LAMBDASTYLE.multi){
            dsName = `${apiName}_dataSource_${key}`
          }
          appsync.appsyncResolverTest(key, "Query", dsName);
          this.code.line()
        }
      })

      mutationFields?.forEach((key)=>{
        if(lambdaStyle){
          let dsName = `${apiName}_dataSource`
          if(lambdaStyle === LAMBDASTYLE.multi){
            dsName = `${apiName}_dataSource_${key}`
          }
          appsync.appsyncResolverTest(key, "Mutation", dsName);
          this.code.line()
        }
      })
    });

    this.code.closeFile(this.outputFile);
    await this.code.save(this.outputDir);
  }
}

export const AppsyncConstructTest = async (
  props: StackBuilderProps
): Promise<void> => {
  const builder = new AppsyncApiConstructTest(props);
  await builder.AppsyncConstructTestFile();
};
