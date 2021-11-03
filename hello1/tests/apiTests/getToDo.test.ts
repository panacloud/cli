import { expect } from "chai";
import supertest from "supertest";
import { AppsyncAPI } from "./AppSyncAPI";
import { testCollections } from "../../lambdaLayer/mockApi/getToDo/testCollections";
const { API_KEY, API_URL } = AppsyncAPI.getInstance();
const request = supertest(process.env.API_URL);
const args = testCollections.fields.getToDo[0].arguments;
const response = testCollections.fields.getToDo[0].response;
const { getToDo } = require("./graphql/output/queries");
describe("run getToDo", () => {
  it("getToDo works correctly", (done) => {
    request
      .post("/graphql")
      .set("x-api-key", process.env.API_KEY)
      .send({ query: getToDo, variables: args })
      .end((err: any, res: any) => {
        expect(err).not.to.be.null;
        expect(res.status).to.equal(200);
        expect(res.body.data[getToDo]).to.equal(response);
        done();
      });
  });
});
