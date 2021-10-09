export const contextInfo = (apiToken: string, entityId: string) => {
  return {
    api_token: apiToken,
    entityId: entityId,
    verifySubscriptionTokenApiUrl:
      "https://vj5t42ne26.execute-api.us-east-1.amazonaws.com/prod/subscriptionToken",
    verifyApiTokenApiUrl:
      "https://vj5t42ne26.execute-api.us-east-1.amazonaws.com/prod/apiToken",
  };
};

// export const lambdaLayerPackageJsonInfo = () => {
//   return {
//     name: "lambda-layer",
//     version: "1.0.0",
//     description: "",
//     main: "index.js",
//     scripts: {
//       "test": "echo \"Error: no test specified\" && exit 1"
//     },
//     author: "",
//     license: "ISC",
//     dependencies: {
//       "axios": "^0.21.1"
//     }
// }
// }