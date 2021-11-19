import { CodeMaker } from "codemaker";
import {
  ApiModel,
  APITYPE,
  ARCHITECTURE,
  CONSTRUCTS,
  DATABASE,
  PanacloudconfigFile
} from "../../../../utils/constants";
import { Appsync } from "../../constructs/Appsync";
import { AuroraServerless } from "../../constructs/AuroraServerless";
import { Cdk } from "../../constructs/Cdk";
import { DynamoDB } from "../../constructs/Dynamodb";
import { Lambda } from "../../constructs/Lambda";
import { Neptune } from "../../constructs/Neptune";
import { EventBridge } from "../../constructs/EventBridge";
import {
  importHandlerForStack,
  LambdaAccessHandler,
  propsHandlerForApiGatewayConstruct,
} from "./functions";
import { LambdaConstructFile } from "../Lambda";
import { Imports } from "../../constructs/ConstructsImports";
// import { LambdaConstructFile } from "../Lambda";
const upperFirst = require("lodash/upperFirst");
const camelCase = require("lodash/camelCase");

type StackBuilderProps = {
  config: ApiModel;
  panacloudConfig: PanacloudconfigFile
};

interface ConstructPropsType {
  name: string;
  type: string;
}


export class CdkStack {
  outputFile: string = `index.ts`;
  outputDir: string = `lib`;
  panacloudConfig: PanacloudconfigFile;
  config: ApiModel;
  code: CodeMaker;

  constructor(props: StackBuilderProps) {
    this.config = props.config;
    this.panacloudConfig = props.panacloudConfig;
    this.code = new CodeMaker();
  }

  async CdkStackFile() {
    this.outputFile = `${this.config.workingDir}-stack.ts`;
    this.code.openFile(this.outputFile);
    const { apiName, database, apiType } =
      this.config.api;
    let mutationsAndQueries: string[] = [];
    if (apiType === APITYPE.graphql) {
      const { queiresFields, mutationFields,asyncFields } = this.config.api;
      mutationsAndQueries = [...queiresFields!, ...mutationFields!];
    }
    const cdk = new Cdk(this.code);
    // const manager = new apiManager(this.code);
    const dynamodb = new DynamoDB(this.code);
    const neptune = new Neptune(this.code);
    const aurora = new AuroraServerless(this.code);
    const imp = new Imports(this.code);
    const lambda = new Lambda(this.code, this.panacloudConfig);
    const appsync = new Appsync(this.code);
    const eventBridge = new EventBridge(this.code);
    importHandlerForStack(database, apiType, this.code, this.config.api.asyncFields);
    imp.importLambda();
    database !== DATABASE.dynamoDB && imp.importEc2()
    this.code.line();

    let ConstructProps: ConstructPropsType[] = [];

    ConstructProps.push({
      name: `prod`,
      type: "string",
    })


    cdk.initializeStack(
      `${upperFirst(camelCase(this.config.workingDir))}`,
      "EnvProps",
      () => {
          // manager.apiManagerInitializer(apiName);
          this.code.line();
        if (database == DATABASE.dynamoDB) {
          dynamodb.dynmaodbConstructInitializer(apiName, this.code);
          this.code.line();
        } else if (database == DATABASE.neptuneDB) {
          neptune.neptunedbConstructInitializer(apiName, this.code);
          this.code.line();
        } else if (database == DATABASE.auroraDB) {
          aurora.auroradbConstructInitializer(apiName, this.code);
          this.code.line();
        }

        LambdaConstructFile(this.config, this.panacloudConfig, this.code)

        database === DATABASE.dynamoDB && LambdaAccessHandler(this.code,this.config.api);

        if (apiType === APITYPE.graphql) {
          appsync.appsyncConstructInitializer(
            this.config.api
          );
        }
        else if (apiType === APITYPE.rest) {
          this.code.line(
            `const ${apiName} = new ${CONSTRUCTS.apigateway}(this,"${apiName}${CONSTRUCTS.apigateway}",{`
          );
          propsHandlerForApiGatewayConstruct(this.code, apiName);
          this.code.line("})");
        }


     

        if (this.config.api.asyncFields &&  this.config.api.asyncFields.length >0) {

          for (let asyncField of this.config.api.asyncFields){
            lambda.addLambdaVar(`${asyncField}_consumer`,{name:'"APPSYNC_API_END_POINT"',value:`${apiName}.api_url`},apiName)
            lambda.addLambdaVar(`${asyncField}_consumer`,{name:'"APPSYNC_API_KEY"',value:`${apiName}.api_key`},apiName)

          }

          eventBridge.eventBridgeConstructInitializer(this.config.api);
        }

        this.code.line(`new AspectController(this, props?.prod)`)


      },
      ConstructProps,
    );


    this.code.closeFile(this.outputFile);
    await this.code.save(this.outputDir);
  }
}

export const CdkStackClass = async (
  props: StackBuilderProps
): Promise<void> => {
  const builder = new CdkStack(props);
  await builder.CdkStackFile();
};
