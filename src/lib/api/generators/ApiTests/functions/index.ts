import { CodeMaker } from "codemaker";

export default class TypeScriptTestWriter {
  public code: CodeMaker;
  constructor(_code: CodeMaker) {
    this.code = _code;
  }
 
  public writeApiTests(key:string){
    this.code.line(`describe ("run ${key}", ()=>{`)
    this.code.line()
    this.code.line(`it("${key} works correctly", (done) => {`)
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
    this.code.line('});')

    this.code.line('});')

  }

}
