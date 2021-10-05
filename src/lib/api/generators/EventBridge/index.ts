import { CodeMaker } from "codemaker";
import { ApiModel, CONSTRUCTS } from "../../../../utils/constants";
import { Cdk } from "../../constructs/Cdk";
import { Imports } from "../../constructs/ConstructsImports";
import { EventBridge } from "../../constructs/EventBridge";

type StackBuilderProps = {
    config: ApiModel;
}

type ConstructPropsType = {
    name: string
    type: string
}

class EventBridgeConstruct {
    outputFile: string = `index.ts`;
    outputDir: string = `lib/${CONSTRUCTS.eventBridge}`;
    config: ApiModel;
    code: CodeMaker;
    constructor(props: StackBuilderProps) {
      this.config = props.config;
      this.code = new CodeMaker();
    }

    async EventBridgeConstructFile() {
        const {
            api: { apiName, mutationFields },
          } = this.config;
        this.code.openFile(this.outputFile);
        const cdk = new Cdk(this.code);
        const imp = new Imports(this.code);
        const eventBridge = new EventBridge(this.code);

        imp.importEventBridge();
        imp.importLambda();

        let ConstructProps: ConstructPropsType[] = [];
        mutationFields?.forEach((key: string, index: number) => {
            ConstructProps[index] = {
                name: `${apiName}_lambdaFn_${key}`,
                type: "lambda.Function"
            }
        })

        cdk.initializeConstruct(`${CONSTRUCTS.eventBridge}`, "EventBridgeConstructProps", () => {
            mutationFields?.forEach((key: string) => {
                eventBridge.createEventBridgeRule(key, apiName);
            })
        }, ConstructProps)

        this.code.closeFile(this.outputFile);
        await this.code.save(this.outputDir);
    }
}

export const eventBridgeConstruct = async (
    props: StackBuilderProps
  ): Promise<void> => {
    const builder = new EventBridgeConstruct(props);
    await builder.EventBridgeConstructFile();
  };