import { CodeMaker } from "codemaker";
import { TypeScriptWriter } from '../../../../utils/typescriptWriter'



class VisitorClass {
    constructor() {
    }

    async DefineVisitorClass(code: CodeMaker) {
        const ts = new TypeScriptWriter(code);
        ts.writeBasicClassBlock({ name: "VisitorClass", export: false,implements: "IAspect" }, undefined, undefined, () => {
        },
            [{
                static: false, name: "visit", visibility: "public", outputType: "void", props: "node: IConstruct", content: () => {
                    code.openBlock("if (node instanceof lambda.Function)")
                    code.closeBlock();
                }
            }
            ]
        )



    }

}



export const defineVisitorClass = async (
    code: CodeMaker
): Promise<void> => {
    const builder = new VisitorClass();
    await builder.DefineVisitorClass(code);
};
