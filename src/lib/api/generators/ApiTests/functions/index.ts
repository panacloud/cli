import { CodeMaker } from "codemaker";
import { TypeScriptWriter } from "../../../../../utils/typescriptWriter";

export default class TypeScriptTestWriter {
  public code: CodeMaker;
  constructor(_code: CodeMaker) {
    this.code = _code;
  }
 
  public writeApiTests(key:string,ts:TypeScriptWriter){
    this.code.line(`describe ("run ${key}", ()=>{`)
    this.code.line()
    this.code.line(`it("${key} works correctly", (done) => {`)
    ts.writeVariableDeclaration(
      {
        name: "totalFields",
        typeName: "",
        initializer: `testCollections.fields.${key}.length`,
        export: false,
      },
      "const"
    );
    this.code.openBlock(`for(let index = 0;index < totalFields;index++)`)
    ts.writeVariableDeclaration(
      {
        name: "args",
        typeName: "",
        initializer: `testCollections.fields.${key}[index].arguments`,
        export: false,
      },
      "let"
    );
    ts.writeVariableDeclaration(
      {
        name: "response",
        typeName: "",
        initializer: `testCollections.fields.${key}[index].response`,
        export: false,
      },
      "let"
    );
    
    this.code.line(`
    request
    .post("/")
    .set("x-api-key",API_KEY)
    .send({ query: ${key} ,variables:args})
    .end((err: any, res: any) => {
      expect(err).to.be.null;
     expect(res.status).to.equal(200);
     expect(res.body.data["${key}"]).to.eql(response);
      done();
    });
    
    `)
    this.code.closeBlock()
    this.code.line('});')

    this.code.line('});')

  }

}
