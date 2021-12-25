import { CodeMaker } from "codemaker";
import {TypeScriptWriter} from '../../../../utils/typescriptWriter'
import { Imports } from "../../constructs/ConstructsImports";



class AspectController {
  constructor() {
  }

  async DefineAspectsController(code:CodeMaker) {
    const ts = new TypeScriptWriter(code);
    
    const imp = new Imports(code);

     imp.importAspects();
     imp.importStack();
     imp.importDefaultVisitor();

    ts.writeBasicClassBlock({name:"AspectController",export:true},undefined,"scope:Stack, prod?: string",()=>{
        code.line("Aspects.of(scope).add(new DefaultVisitor());")
    })

  }
}

export const defineAspectController = async (
    code:CodeMaker
): Promise<void> => {
  const builder = new AspectController();
  await builder.DefineAspectsController(code);
};
