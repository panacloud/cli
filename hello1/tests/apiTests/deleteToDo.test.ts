import { expect } from "chai";
import supertest from "supertest";
import { AppsyncAPI } from "./AppSyncAPI";
import { testCollections } from "../../lambdaLayer/mockApi/deleteToDo/testCollections";
const { API_KEY, API_URL } = AppsyncAPI.getInstance();
const request = supertest(process.env.API_URL);
const args = testCollections.fields.deleteToDo[0].arguments;
const response = testCollections.fields.deleteToDo[0].response;
const { deleteToDo } = require("./graphql/output/mutations");
describe("run deleteToDo", () => {
  it("deleteToDo works correctly", (done) => {
    request
      .post("/graphql")
      .set("x-api-key", process.env.API_KEY)
      .send({ query: deleteToDo, variables: args })
      .end((err: any, res: any) => {
        expect(err).not.to.be.null;
        expect(res.status).to.equal(200);
        expect(res.body.data[deleteToDo]).to.equal(response);
        done();
      });
  });
});
