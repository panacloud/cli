import { expect } from "chai";
import supertest from "supertest";
import { AppsyncAPI } from "./AppSyncAPI";
import { testCollections } from "../../lambdaLayer/mockApi/deleteToDos/testCollections";
const { API_KEY, API_URL } = AppsyncAPI.getInstance();
const request = supertest(process.env.API_URL);
const args = testCollections.fields.deleteToDos[0].arguments;
const response = testCollections.fields.deleteToDos[0].response;
const { deleteToDos } = require("./graphql/output/mutations");
describe("run deleteToDos", () => {
  it("deleteToDos works correctly", (done) => {
    request
      .post("/graphql")
      .set("x-api-key", process.env.API_KEY)
      .send({ query: deleteToDos, variables: args })
      .end((err: any, res: any) => {
        expect(err).not.to.be.null;
        expect(res.status).to.equal(200);
        expect(res.body.data[deleteToDos]).to.equal(response);
        done();
      });
  });
});
