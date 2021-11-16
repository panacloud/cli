import { expect } from "chai";
import supertest from "supertest";
import { AppsyncAPI } from "./AppSyncAPI";
import { testCollections } from "../../lambdaLayer/mockApi/user/testCollections";
const { API_KEY, API_URL } = AppsyncAPI.getInstance();
const request = supertest(API_URL);
const args = testCollections.fields.user[0].arguments;
const response = testCollections.fields.user[0].response;
const { user } = require("./graphql/queries");
describe("run user", () => {
  it("user works correctly", (done) => {
    request
      .post("/")
      .set("x-api-key", API_KEY)
      .send({ query: user, variables: args })
      .end((err: any, res: any) => {
        expect(err).to.be.null;
        expect(res.status).to.equal(200);
        expect(res.body.data["user"]).to.eql(response);
        done();
      });
  });
});
