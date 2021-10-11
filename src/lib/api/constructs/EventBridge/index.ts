import { CodeMaker } from "codemaker";
import { API, CONSTRUCTS } from "../../../../utils/constants";
import { TypeScriptWriter } from "../../../../utils/typescriptWriter";

export class EventBridge {
    code: CodeMaker;
    constructor(_code: CodeMaker) {
        this.code = _code;
    }

    public eventBridgeConstructInitializer(config: API) {
        const { apiName, mutationFields } = config;
        const ts = new TypeScriptWriter(this.code);
        ts.writeVariableDeclaration(
            {
                name: `${apiName}`,
                typeName: CONSTRUCTS.eventBridge,
                initializer: () => {
                    this.code.line(
                        `new ${CONSTRUCTS.eventBridge}(this,"${apiName}${CONSTRUCTS.eventBridge}",{`
                    );
                    mutationFields?.forEach((field) => {
                        this.code.line(`${apiName}_lambdaFn_${field}: ${apiName}_lambdaFn_${field},`);
                    })
                    this.code.line("})");
                },
            },
            "const"
        );
    }

    public grantPutEvents(name: string, functionName: string) {
        this.code.line(`events.EventBus.grantAllPutEvents(${name}_lambdaFn_${functionName});`)
    }


    public createEventBridgeRule(name: string, apiName: string) {
        const ts = new TypeScriptWriter(this.code);
        ts.writeVariableDeclaration(
            {
                name: `eventBridgeApiRule_${name}`,
                typeName: "events.Rule",
                initializer: () => {
                    this.code.line(`new events.Rule(this, "EventBridgeApiRule_${name}", {
                targets: [new targets.LambdaFunction(props!.${apiName}_lambdaFn_${name}_consumer)],
                description: "Filter events based on mutationType and call relevant lambda",
                eventPattern: {
                    detail: {
                        mutationName: ["${name}"]
                    }
                }
            })`);
                },
            },
            "const"
        );
    }
}