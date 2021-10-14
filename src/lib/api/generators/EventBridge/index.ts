import { CodeMaker } from "codemaker";
import { ApiModel, CONSTRUCTS, ARCHITECTURE } from "../../../../utils/constants";
import { Cdk } from "../../constructs/Cdk";
import { Imports } from "../../constructs/ConstructsImports";
import { EventBridge } from "../../constructs/EventBridge";
import { LambdaFunction } from "../../constructs/Lambda/lambdaFunction";
import { Lambda } from "../../constructs/Lambda";
import { TypeScriptWriter } from "../../../../utils/typescriptWriter";

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
        // const lambda = new LambdaFunction(this.code);
        // const lambda = new Lambda(this.code, this.panacloudConfig);

        imp.importEventBridge();
        imp.importLambda();

        let ConstructProps: ConstructPropsType[] = [];
        mutationFields?.forEach((key: string, index: number) => {
            ConstructProps.push({
                name: `${apiName}_lambdaFn_${key}`,
                type: "lambda.Function"
            })
            ConstructProps.push({
                name: `${apiName}_lambdaFn_${key}_consumer`,
                type: "lambda.Function"
            })
        })

        cdk.initializeConstruct(`${CONSTRUCTS.eventBridge}`, "EventBridgeConstructProps", () => {
            mutationFields?.forEach((key: string) => {
                eventBridge.grantPutEvents(apiName, key);
                eventBridge.createEventBridgeRule(apiName, key);
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