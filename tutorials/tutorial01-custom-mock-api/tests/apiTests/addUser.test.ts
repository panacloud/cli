import { expect } from "chai";
import supertest from "supertest";
import { AppsyncAPI } from "./AppSyncAPI";
import { testCollections } from "../../editable_src/customMockLambdaLayer/mockData/addUser/testCollections";
const { API_KEY, API_URL } = AppsyncAPI.getInstance();
const request = supertest(API_URL);
const { addUser } = require("./graphql/mutations");
describe("run addUser", () => {
  it("addUser works correctly", (done) => {
    const totalFields = testCollections.fields.addUser.length;
    for (let index = 0; index < totalFields; index++) {
      let args = testCollections.fields.addUser[index].arguments;
      let response = testCollections.fields.addUser[index].response;
      request
        .post("/")
        .set("x-api-key", API_KEY)
        .send({ query: addUser, variables: args })
        .end((err: any, res: any) => {
          expect(err).to.be.null;
          expect(res.status).to.equal(200);
          expect(res.body.data["addUser"]).to.eql(response);
          done();
        });
    }
  });
});
