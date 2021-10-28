const { execSync } = require("child_process");
const expect = require("chai").expect;

describe("hello", () => {
  before(async () => {
    execSync("mkdir hello")
    execSync(`cd hello && ../bin/run init -t mateen7861`)
    execSync(`cd hello && yarn build`)
    execSync(`cd hello && cdk deploy`)
  });
  after(async () => {
    execSync("cd hello && cdk destroy")
    execSync("rmdir hello")
  });

  describe("Api", () => {
    it("Returns user with id = 10", (done) => {
        let isError = false;
        try {
            execSync(`cd hello && yarn test`)
        } catch (error) {
            isError = true
        }
        expect(isError).to.be(false)
        done()
        });
  });
});
