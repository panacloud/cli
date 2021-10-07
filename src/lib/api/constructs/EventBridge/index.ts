import { CodeMaker } from "codemaker";
import { TypeScriptWriter } from "../../../../utils/typescriptWriter";

export class EventBridge {
    code: CodeMaker;
    constructor(_code: CodeMaker) {
      this.code = _code;
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