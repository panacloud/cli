import { expect } from "chai";
import supertest from "supertest";
import { AppsyncAPI } from "./AppSyncAPI";
import { testCollections } from "../../lambdaLayer/mockApi/createToDo/testCollections";
const { API_KEY, API_URL } = AppsyncAPI.getInstance();
const request = supertest(process.env.API_URL);
const args = testCollections.fields.createToDo[0].arguments;
const response = testCollections.fields.createToDo[0].response;
const { createToDo } = require("./graphql/output/mutations");
describe("run createToDo", () => {
  it("createToDo works correctly", (done) => {
    request
      .post("/graphql")
      .set("x-api-key", process.env.API_KEY)
      .send({ query: createToDo, variables: args })
      .end((err: any, res: any) => {
        expect(err).not.to.be.null;
        expect(res.status).to.equal(200);
        expect(res.body.data[createToDo]).to.equal(response);
        done();
      });
  });
});
