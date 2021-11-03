import { expect } from "chai";
import supertest from "supertest";
import { AppsyncAPI } from "./AppSyncAPI";
import { testCollections } from "../../lambdaLayer/mockApi/updateToDo/testCollections";
const { API_KEY, API_URL } = AppsyncAPI.getInstance();
const request = supertest(process.env.API_URL);
const args = testCollections.fields.updateToDo[0].arguments;
const response = testCollections.fields.updateToDo[0].response;
const { updateToDo } = require("./graphql/output/mutations");
describe("run updateToDo", () => {
  it("updateToDo works correctly", (done) => {
    request
      .post("/graphql")
      .set("x-api-key", process.env.API_KEY)
      .send({ query: updateToDo, variables: args })
      .end((err: any, res: any) => {
        expect(err).not.to.be.null;
        expect(res.status).to.equal(200);
        expect(res.body.data[updateToDo]).to.equal(response);
        done();
      });
  });
});
