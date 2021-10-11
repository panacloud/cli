import {
    ApiModel,
  } from "../../../../utils/constants";
 
  import { CodeMaker } from "codemaker";
import { Imports } from "../../constructs/ConstructsImports";
 
  import {aspectBaseClass} from './aspectBaseClass'
import { defineVisitorClass } from "./visitorClass";

  type props = {
    config: ApiModel;
  };
  
  class createAspects {
    code: CodeMaker;
    outputFile: string = `index.ts`;
    outputDir: string = `custom_src/aspects`;
    stackName:string

    constructor(props: props) {
        this.code = new CodeMaker();
        this.stackName = props.config.workingDir;
    }
  
    async defineAspects() {

    this.code.openFile(this.outputFile);

    const imp = new Imports(this.code);

     imp.importLambda();
     imp.importAspects();
     imp.importIaspect();
     imp.importStack();
     imp.importIconstruct();
     await aspectBaseClass(this.code)
     await defineVisitorClass(this.code)
     this.code.closeFile(this.outputFile);
     await this.code.save(this.outputDir);
    }
  }
  
  export const CreateAspects = async (
   props: props
  ): Promise<void> => {
    const builder = new createAspects(props);
    await builder.defineAspects();
  };
  