import { Command, flags } from "@oclif/command";
import { printSchema } from "graphql";
import { makeExecutableSchema } from "@graphql-tools/schema";
import { startSpinner, stopSpinner } from "../lib/spinner";
import { writeFileAsync, mkdirRecursiveAsync } from "../lib/fs";
const tools = require("graphql-schema-utilities");

export default class Merge extends Command {
  static description = "Merge multiple GraphQL schema in one";
  static args = [{ name: "graphqlschema", required: true }];
  static flags = {
    help: flags.help({ char: "h" }),
    schema: flags.string({
      char: "s",
      description:
        "Use a glob path that would define all of your schema files to merge them into a valid schema. (default: '')",
      required: true,
    }),
    output: flags.string({
      char: "o",
      description:
        "The file path where the merged schema will be outputted to.",
      required: true,
    }),
  };

  async run() {
    const { args, flags } = this.parse(Merge);
    const mergeSpinner = startSpinner("Merging GraphQL Schema");

    tools
      .mergeGQLSchemas(flags.schema)
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
            schema.getSubscriptionType() ? "\n  subscription: Subscription" : ""
          }  \n}\n\n`;
          data = typeDefs + data;
        }

        makeExecutableSchema({ typeDefs: data });

        writeFileAsync(flags.output, data, (err: string) => {
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
