import { CodeMaker } from "codemaker";
import {TypeScriptWriter} from '../../../../utils/typescriptWriter'



class BaseClass {
  constructor() {
  }

  async DefineAspectBaseClass(code:CodeMaker) {
    const ts = new TypeScriptWriter(code);
    ts.writeInterfaceBlock("props",[{name:"scope", type: "Stack"}])
    ts.writeBasicClassBlock({name:"AspectBaseClass",export:true},undefined,"props",()=>{
        code.line("Aspects.of(props.scope).add(new VisitorClass());")
    })

  }
}

export const aspectBaseClass = async (
    code:CodeMaker
): Promise<void> => {
  const builder = new BaseClass();
  await builder.DefineAspectBaseClass(code);
};
