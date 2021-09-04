// import { CodeMaker } from "codemaker";
// import { TypeScriptWriter } from "../../../../../utils/typescriptWriter";
// import {
//   CONSTRUCTS,
//   Config,
//   LAMBDASTYLE,
// } from "../../../../../utils/constants";
// import { Cdk } from "../../../constructs/Cdk";
// import { Imports } from "../../../constructs/ConstructsImports";
// import { Iam } from "../../../constructs/Iam";
// import { Appsync } from "../../../constructs/Appsync";

// type StackBuilderProps = {
//     config: Config;
//   };
  
//   export class LambdaConstructTest {
//     outputFile: string = `${CONSTRUCTS.appsync}.test.ts`;
//     outputDir: string = `test`;
//     config: Config;
//     code: CodeMaker;
  
//     constructor(props: StackBuilderProps) {
//       this.config = props.config;
//       this.code = new CodeMaker();
//     }
  
//     async construcAppsyncConstructTestFile() {
//       const ts = new TypeScriptWriter(this.code);
//       this.code.openFile(this.outputFile);
//       const { apiName, lambdaStyle, database } = this.config.api;
//       const iam = new Iam();
//       const appsync = new Appsync();
//       const imp = new Imports();
//       const testClass = new Cdk();

//     //   const mutations = model.type.Mutation ? model.type.Mutation : {};
//     //   const queries = model.type.Query ? model.type.Query : {};
//       const mutationsAndQueries = { ...mutations, ...queries };
//       imp.ImportsForTest(this.outputDir, "pattern_v1");
//       imp.importForAppsyncConstructInTest();
//       imp.importForLambdaConstructInTest();
//       testClass.initializeTest(
//         "Appsync Api Constructs Test",
//         () => {
//           appsync.apiName = apiName;
//           iam.appsyncConsturctIdentifier();
//           this.code.line();
//           iam.appsyncApiIdentifier();
//           this.code.line();
//           appsync.appsyncApiTest();
//           this.code.line();
//           appsync.appsyncApiKeyTest();
//           this.code.line();
//           iam.appsyncRoleIdentifier();
//           this.code.line();
//           iam.appsyncServiceRoleTest();
//           this.code.line();
//           iam.appsyncRolePolicyTest();
//           this.code.line();
//           iam.lambdaConsturctIdentifier();
//           this.code.line();
//           iam.lambdaIdentifier();
//           this.code.line();

//           if (lambdaStyle === LAMBDASTYLE.single) {
//             let dsName = `${apiName}_dataSource`;
//             appsync.appsyncDatasourceTest(dsName, 0);
//           } else if (lambdaStyle === LAMBDASTYLE.multi && mutationsAndQueries) {
//             Object.keys(mutationsAndQueries).forEach((key, index) => {
//               if (lambdaStyle === LAMBDASTYLE.multi) {
//                 let dsName = `${apiName}_dataSource_${key}`;
//                 appsync.appsyncDatasourceTest(dsName, index);
//                 this.code.line();
//               }
//             });
//           }
//           this.code.line();

//           if (model?.type?.Query) {
//             for (var key in model?.type?.Query) {
//               if (lambdaStyle === LAMBDASTYLE.single) {
//                 appsync.appsyncResolverTest(
//                   key,
//                   "Query",
//                   `${apiName}_dataSource`
//                 );
//               }
//               if (lambdaStyle === LAMBDASTYLE.multi) {
//                 appsync.appsyncResolverTest(
//                   key,
//                   "Query",
//                   `${apiName}_dataSource_${key}`
//                 );
//                 this.code.line();
//               }
//             }
//           }
//           this.code.line();

//           if (model?.type?.Mutation) {
//             for (var key in model?.type?.Mutation) {
//               if (lambdaStyle === LAMBDASTYLE.single) {
//                 appsync.appsyncResolverTest(
//                   key,
//                   "Mutation",
//                   `${apiName}_dataSource`
//                 );
//                 this.code.line();
//               }
//               if (lambdaStyle === LAMBDASTYLE.multi) {
//                 appsync.appsyncResolverTest(
//                   key,
//                   "Mutation",
//                   `${apiName}_dataSource_${key}`
//                 );
//                 this.code.line();
//               }
//             }
//           }
//         },
//         this.outputDir,
//         "pattern_v1"
//       );
//     }
// };
    
        
  