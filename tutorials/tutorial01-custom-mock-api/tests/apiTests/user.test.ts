import { expect } from "chai";
import supertest from "supertest";
import { AppsyncAPI } from "./AppSyncAPI";
import { testCollections } from "../../mock_lambda_layer/mockData/user/testCollections";
const { API_KEY, API_URL } = AppsyncAPI.getInstance();
const request = supertest(API_URL);
const { user } = require("./graphql/queries");
describe("run user", () => {
  it("user works correctly", (done) => {
    const totalFields = testCollections.fields.user.length;
    for (let index = 0; index < totalFields; index++) {
      let args = testCollections.fields.user[index].arguments;
      let response = testCollections.fields.user[index].response;
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
    }
  });
});
