import { CodeMaker } from "codemaker";
import { TypeScriptWriter } from "../../../../utils/typescriptWriter";

export class EventBridge {
    code: CodeMaker;
    constructor(_code: CodeMaker) {
      this.code = _code;
    }

    public createEventBridgeRule(name: string) {
        const ts = new TypeScriptWriter(this.code);
        ts.writeVariableDeclaration(
          {
            name: `eventBridgeApiRule_${name}`,
            typeName: "events.Rule",
            initializer: () => {
              this.code.line(`new events.Rule(this, "EventBridgeApiRule_${name}", {
                targets: [new targets.LambdaFunction(props!.eventBridge_lambdaFn_${name})],
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