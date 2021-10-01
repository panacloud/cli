import { Command, flags } from "@oclif/command";
import { printSchema } from "graphql";
import { makeExecutableSchema } from "@graphql-tools/schema";
import { startSpinner, stopSpinner } from "../lib/spinner";
import { writeFileAsync, mkdirRecursiveAsync } from "../lib/fs";
import { mergeInputs } from "../lib/inquirer";
import { APITYPE } from "../utils/constants";
const tools = require("graphql-schema-utilities");

export default class Merge extends Command {
  static description = "Merge multiple GraphQL schema in one";
  static flags = {
    help: flags.help({ char: "h" }),
  };

  async run() {
    const { flags } = this.parse(Merge);

    let config = await mergeInputs();

    const mergeSpinner = startSpinner("Merging GraphQL Schema");

    if (config.api_type === APITYPE.graphql) {
      tools
        .mergeGQLSchemas(config.schema)
        .then((schema: any) => {
          let data = "";
          data = printSchema(schema);

          if (
            schema.getQueryType().toString() === "Query" &&
            (!schema.getMutationType() ||
              schema.getMutationType().toString() === "Mutation") &&
            (!schema.getSubscriptionType() ||
              schema.getSubscriptionType().toString() === "Subscription")
          ) {
            const typeDefs = `schema { \n  query: Query ${
              schema.getMutationType() ? "\n  mutation: Mutation" : ""
            } ${
              schema.getSubscriptionType()
                ? "\n  subscription: Subscription"
                : ""
            }  \n}\n\n`;
            data = typeDefs + data;
          }

          // Validating Schema
          makeExecutableSchema({ typeDefs: data });

          writeFileAsync(config.output, data, (err: string) => {
            if (err) {
              stopSpinner(mergeSpinner, `Error: ${err}`, true);
              process.exit(1);
            }
          });
          stopSpinner(mergeSpinner, `Done`, false);
        })

        .catch((error: any) => {
          stopSpinner(
            mergeSpinner,
            `schema files were merged, and the valid schema is: ${error}`,
            true
          );
          process.exit(1);
        });
    }
  }
}
