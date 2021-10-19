const exec = require("await-exec");
const expect = require("chai").expect;
const url = `https://zs6b556wcbdifl4sjy2bslw2xy.appsync-api.us-east-2.amazonaws.com/`;
const request = require("supertest")(url);

describe("hello", () => {
  before(async () => {
    console.log("start");
    console.log("testing .....");
    // exec("mkdir hello")
    // exec(`cd hello && ../bin/run init -t mateen7861`)
    // exec(`cd hello && yarn build`)
    // exec(`cd hello && cdk deploy`)
  });
  after(async () => {
    console.log("end");
    // exec("cd hello && cdk destroy")
    // exec("rmdir hello")
  });
  it("display hello", () => {
    console.log("hello");
  });

  describe("GraphQL", () => {
    it("Returns user with id = 10", (done) => {
      request
        .post("/graphql")
        .set("x-api-key", "api-key")
        .send({ query: "{ getTodos { id title done } }" })
        .end((err: any, res: any) => {
          expect(err).to.be.null;
          expect(res.status).to.equal(200);
          expect(res.body.data.getTodos.length).to.equal(1);
          console.log(res.body.data.getTodos);
          done();
        });
    });
  });
});
