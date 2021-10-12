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
                name: `${apiName}_eventBridge`,
                typeName: CONSTRUCTS.eventBridge,
                initializer: () => {
                    this.code.line(
                        `new ${CONSTRUCTS.eventBridge}(this,"${apiName}${CONSTRUCTS.eventBridge}",{`
                    );
                    mutationFields?.forEach((field) => {
                        this.code.line(`${apiName}_lambdaFn_${field}Arn: ${apiName}Lambda.${apiName}_lambdaFn_${field}Arn,`);
                        this.code.line(`${apiName}_lambdaFn_${field}_consumerArn: ${apiName}Lambda.${apiName}_lambdaFn_${field}_consumerArn,`);
                    })
                    this.code.line("})");
                },
            },
            "const"
        );
    }

    public grantPutEvents(apiName: string, functionName: string) {
        const producerName = `${apiName}_lambdaFn_${functionName}_producer`;
        const ts = new TypeScriptWriter(this.code);
        ts.writeVariableDeclaration({
            name: producerName,
            typeName: "lambda.IFunction",
            initializer: () => this.code.line(`
                lambda.Function.fromFunctionArn(this, '${apiName}_${functionName}_putEvent', props!.${apiName}_lambdaFn_${functionName}Arn)
            `)
        }, 'const');
        this.code.line();
        this.code.line(`events.EventBus.grantAllPutEvents(${producerName});`);
    }


    public createEventBridgeRule(apiName: string, functionName: string) {
        const ts = new TypeScriptWriter(this.code);
        const consumerName = `${apiName}_lambdaFn_${functionName}_consumer`;
        ts.writeVariableDeclaration({
            name: consumerName,
            typeName: "lambda.IFunction",
            initializer: () => this.code.line(`
                lambda.Function.fromFunctionArn(this, '${apiName}_${functionName}_rule', props!.${apiName}_lambdaFn_${functionName}_consumerArn)
            `)
        }, 'const')
        this.code.line()
        ts.writeVariableDeclaration(
            {
                name: `eventBridgeApiRule_${functionName}`,
                typeName: "events.Rule",
                initializer: () => {
                    this.code.line(`new events.Rule(this, "EventBridgeApiRule_${functionName}", {
                targets: [new targets.LambdaFunction(${consumerName})],
                description: "Filter events based on mutationType and call relevant lambda",
                eventPattern: {
                    source: ["${apiName}"],
                    detail: {
                        mutation: ["${functionName}"]
                    }
                }
            })`);
                },
            },
            "const"
        );
        this.code.line()
    }
}