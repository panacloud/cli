import { expect } from "chai";
import supertest from "supertest";
import { AppsyncAPI } from "./AppSyncAPI";
import { testCollections } from "../../lambdaLayer/mockApi/getToDos/testCollections";
const { API_KEY, API_URL } = AppsyncAPI.getInstance();
const request = supertest(process.env.API_URL);
const args = testCollections.fields.getToDos[0].arguments;
const response = testCollections.fields.getToDos[0].response;
const { getToDos } = require("./graphql/output/queries");
describe("run getToDos", () => {
  it("getToDos works correctly", (done) => {
    request
      .post("/graphql")
      .set("x-api-key", process.env.API_KEY)
      .send({ query: getToDos, variables: args })
      .end((err: any, res: any) => {
        expect(err).not.to.be.null;
        expect(res.status).to.equal(200);
        expect(res.body.data[getToDos]).to.equal(response);
        done();
      });
  });
});
