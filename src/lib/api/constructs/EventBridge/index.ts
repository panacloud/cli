import { CodeMaker } from "codemaker";
import { TypeScriptWriter } from "../../../../utils/typescriptWriter";

export class EventBridge {
    code: CodeMaker;
    constructor(_code: CodeMaker) {
      this.code = _code;
    }

    public grantPutEvents(name: string) {
      this.code.line(`events.EventBus.grantAllPutEvents(${name}_lambdaFn_eventProducer);`)
    }

    public createEventBridgeRule(name: string, apiName: string) {
        const ts = new TypeScriptWriter(this.code);
        ts.writeVariableDeclaration(
          {
            name: `eventBridgeApiRule_${name}`,
            typeName: "events.Rule",
            initializer: () => {
              this.code.line(`new events.Rule(this, "EventBridgeApiRule_${name}", {
                targets: [new targets.LambdaFunction(props!.${apiName}_lambdaFn_${name})],
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