import { expect } from "chai";
import supertest from "supertest";
import { AppsyncAPI } from "./AppSyncAPI";
import { testCollections } from "../../lambdaLayer/mockApi/addUser/testCollections";
const { API_KEY, API_URL } = AppsyncAPI.getInstance();
const request = supertest(API_URL);
const args = testCollections.fields.addUser[0].arguments;
const response = testCollections.fields.addUser[0].response;
const { addUser } = require("./graphql/mutations");
describe("run addUser", () => {
  it("addUser works correctly", (done) => {
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
  });
});
