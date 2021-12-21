import { CodeMaker } from "codemaker";
import {
  ApiModel,
  APITYPE,
  ARCHITECTURE,
  Config,
  async_response_mutName,
} from "../../../../utils/constants";
import { LambdaFunction } from "../../constructs/Lambda/lambdaFunction";
import { Imports } from "../../constructs/ConstructsImports";
const fs = require("fs");
const exec = require("await-exec");
const fse = require("fs-extra");
const path = require("path");
import { mkdirRecursiveAsync } from "../../../fs";

type StackBuilderProps = {
  config: ApiModel;
  type: string;
};

class CustomLambda {
  outputFile: string = `index.ts`;
  config: ApiModel;
  outputDir: string = `lambda`;
  type: string;

  constructor(props: StackBuilderProps) {
    this.config = props.config;
    this.type = props.type;
  }

  async LambdaFile() {
    const {
      api: {
        apiType,
        generalFields,
        microServiceFields,
        mutationFields,
        apiName,
        mySchema,
        nestedResolver,
        nestedResolverFieldsAndLambdas,
        asyncFields,
        database,
        neptuneQueryLanguage,
        mockApiData,
      },
    } = this.config;

    if (apiType === APITYPE.graphql) {
      const microServices = Object.keys(microServiceFields!);

      let microservice_files: any = {};
      fs.readdirSync(`${process.cwd()}/editable_src/lambda_stubs`).forEach(
        (file: string) => {
          if (microServices.includes(file)) {
            const micro_sub_files: string[] = [];
            fs.readdirSync(
              `${process.cwd()}/editable_src/lambda_stubs/${file}`
            ).forEach((inner: string) => {
              micro_sub_files.push(inner);
            });
            microservice_files = {
              ...microservice_files,
              [file]: micro_sub_files.filter(
                (val: string) => val.split("_").pop() !== "consumer"
              ),
            };
          }
        }
      );

      const newMicroServices = Object.keys(microservice_files);

      let differenceMicroserviceLambdas = newMicroServices
        .filter((val) => !microServices.includes(val))
        .concat(microServices.filter((val) => !newMicroServices.includes(val)));

      for (const ele of differenceMicroserviceLambdas) {
        if (
          !fs.existsSync(`${process.cwd()}/editable_src/lambda_stubs/${ele}`)
        ) {
          await mkdirRecursiveAsync(`editable_src/lambda_stubs/${ele}`);
        }
      }

      for (const service of microServices) {
        let newMicroServicesLambdas: string[] = microServiceFields![service];
        let prevMicroLambda: string[] =
          microservice_files[service] === undefined
            ? []
            : microservice_files[service];

        let differenceMicroServicesLambdas = newMicroServicesLambdas
          .filter((val) => !prevMicroLambda.includes(val))
          .concat(
            prevMicroLambda.filter(
              (val: any) => !newMicroServicesLambdas.includes(val)
            )
          );

        const newServices: string[] = [];
        for (const ele of newMicroServicesLambdas) {
          if (differenceMicroServicesLambdas.includes(ele)) {
            newServices.push(ele);
          }
        }

        for (let diff of newServices) {
          const code = new CodeMaker();
          const lambda = new LambdaFunction(code);
          const imp = new Imports(code);
          const isMutation = mutationFields?.includes(diff);
          code.openFile(this.outputFile);

          imp.importAxios();
          code.line();

          lambda.emptyLambdaFunction(
            undefined,
            database,
            neptuneQueryLanguage!,
            isMutation,
            mockApiData,
            diff,
            true,
            mySchema
          );

          code.closeFile(this.outputFile);

          this.outputDir = `editable_src/lambda_stubs/${service}/${diff}`;

          await code.save(this.outputDir);

          await exec(
            `cd ${process.cwd()}/editable_src/lambda_stubs/${service}/${diff} &&  npm init -y`
          );

          if (asyncFields && asyncFields.includes(diff)) {
            fs.readdirSync(
              `${process.cwd()}/editable_src/lambda_stubs/${service}`
            ).forEach(async (file: string) => {
              if (file !== `${diff}_consumer`) {
                const code = new CodeMaker();
                const lambda = new LambdaFunction(code);
                const imp = new Imports(code);

                this.outputFile = "index.ts";
                code.openFile(this.outputFile);

                code.line();

                lambda.appsyncMutationInvokeFunction();

                code.closeFile(this.outputFile);
                this.outputDir = `editable_src/lambda_stubs/${service}/${diff}_consumer`;
                await code.save(this.outputDir);
              }
            });
          }
        }
      }

      const general_files: string[] = [];
      fs.readdirSync(`${process.cwd()}/editable_src/lambda_stubs`).forEach(
        (file: string) => {
          if (file !== "nestedResolvers") {
            if (!microServices.includes(file)) {
              general_files.push(file);
            }
          }
        }
      );

      const new_asyncField: string[] = [];
      asyncFields?.forEach((field) => {
        if (generalFields?.includes(field)) {
          new_asyncField?.push(`${field}_consumer`);
        }
      });

      const generalFieldsEvent = [...generalFields!, ...new_asyncField!];

      let differenceLambdas = generalFieldsEvent!.filter(
        (val) => !general_files.includes(val)
      );

      for (const ele of differenceLambdas) {
        if (ele !== async_response_mutName) {
          const code = new CodeMaker();
          const lambda = new LambdaFunction(code);
          const imp = new Imports(code);

          const key = ele;
          this.outputFile = "index.ts";
          const isMutation = mutationFields?.includes(key);

          code.openFile(this.outputFile);

          imp.importAxios();
          code.line();

          lambda.emptyLambdaFunction(
            undefined,
            database,
            neptuneQueryLanguage!,
            isMutation,
            mockApiData,
            key,
            false,
            mySchema
          );

          code.closeFile(this.outputFile);

          this.outputDir = `editable_src/lambda_stubs/${key}`;

          await code.save(this.outputDir);

          await exec(
            `cd ${process.cwd()}/editable_src/lambda_stubs/${key} &&  npm init -y`
          );
        }
      }

      if (nestedResolver) {
        if (this.type === "update") {
          if (
            !fs.existsSync(
              `${process.cwd()}/editable_src/lambda_stubs/nestedResolvers`
            )
          ) {
            await mkdirRecursiveAsync(
              `editable_src/lambda_stubs/nestedResolvers`
            );
          }

          const files: string[] = [];
          fs.readdirSync(
            `${process.cwd()}/editable_src/lambda_stubs/nestedResolvers`
          ).forEach((file: string) => {
            files.push(file);
          });

          let differenceNestedLambdas =
            nestedResolverFieldsAndLambdas?.nestedResolverLambdas
              .filter((val) => !files.includes(val))
              .concat(
                files.filter(
                  (val) =>
                    !nestedResolverFieldsAndLambdas?.nestedResolverLambdas.includes(
                      val
                    )
                )
              );

          for (const ele of differenceNestedLambdas!) {
            const code = new CodeMaker();
            const lambda = new LambdaFunction(code);
            const imp = new Imports(code);
            this.outputFile = "index.ts";
            code.openFile(this.outputFile);
            code.line();
            imp.importAxios();

            // lambda.emptyLambdaFunction(
            //   true,
            //   database,
            //   neptuneQueryLanguage!,
            //   false,
            //   mockApiData,
            //   ele,
            //   false,
            //   mySchema
            // )

            code.closeFile(this.outputFile);
            this.outputDir = `editable_src/lambda_stubs/nestedResolvers/${ele}`;
            await code.save(this.outputDir);
          }
        } else {
          const {
            api: { nestedResolverFieldsAndLambdas },
          } = this.config;
          const { nestedResolverLambdas } = nestedResolverFieldsAndLambdas!;
          for (let index = 0; index < nestedResolverLambdas.length; index++) {
            const key = nestedResolverLambdas[index];
            const code = new CodeMaker();
            const imp = new Imports(code);
            const lambda = new LambdaFunction(code);
            this.outputFile = "index.ts";
            code.openFile(this.outputFile);
            code.line();
            imp.importAxios();
            lambda.helloWorldFunction(
              apiName,
              database,
              neptuneQueryLanguage!,
              mockApiData,
              key
            );
            // lambda.emptyLambdaFunction(
            //   true,
            //   database,
            //   neptuneQueryLanguage!,
            //   false,
            //    mockApiData,
            //   key,
            //   false,
            //   gqlSchema?:GraphQLSchema
            // )
            code.closeFile(this.outputFile);

            this.outputDir = `editable_src/lambda_stubs/nestedResolvers/${key}`;

            await code.save(this.outputDir);

            await exec(
              `cd ${process.cwd()}/editable_src/lambda_stubs/nestedResolvers/${key} &&  npm init -y`
            );
          }
        }
      }
    }
  }
}

export const customLambda = async (props: StackBuilderProps): Promise<void> => {
  const builder = new CustomLambda(props);
  await builder.LambdaFile();
};
