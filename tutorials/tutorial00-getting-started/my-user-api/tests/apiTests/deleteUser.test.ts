import { expect } from "chai";
import supertest from "supertest";
import { AppsyncAPI } from "./AppSyncAPI";
import { testCollections } from "../../lambdaLayer/mockApi/deleteUser/testCollections";
const { API_KEY, API_URL } = AppsyncAPI.getInstance();
const request = supertest(API_URL);
const args = testCollections.fields.deleteUser[0].arguments;
const response = testCollections.fields.deleteUser[0].response;
const { deleteUser } = require("./graphql/mutations");
describe("run deleteUser", () => {
  it("deleteUser works correctly", (done) => {
    request
      .post("/")
      .set("x-api-key", API_KEY)
      .send({ query: deleteUser, variables: args })
      .end((err: any, res: any) => {
        expect(err).to.be.null;
        expect(res.status).to.equal(200);
        expect(res.body.data["deleteUser"]).to.eql(response);
        done();
      });
  });
});
