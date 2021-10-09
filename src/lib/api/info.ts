const fse = require("fs-extra");

import { PanacloudconfigFile, PanacloudConfiglambdaParams } from "../../utils/constants";
import { stopSpinner } from "../spinner";

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



export const generatePanacloudConfig = async (
  queiresFields: string[],
  mutationFields: string[]
) => {
  let mutationsAndQueries: string[] = [...queiresFields!, ...mutationFields!];

  let configJson: PanacloudconfigFile = { lambdas: {} };
  mutationsAndQueries.forEach((key: string) => {
    const lambdas = configJson.lambdas[key] = {} as PanacloudConfiglambdaParams
    lambdas.asset_path = `lambda/${key}/index.ts`;
  });
  await fse.writeJson(`./custom_src/panacloudconfig.json`, configJson);
};

export const updatePanacloudConfig = async (
  queiresFields: string[],
  mutationFields: string[],
  spinner: any
) => {
  let newLambdas: string[] = [...queiresFields!, ...mutationFields!];

  const configPanacloud: PanacloudconfigFile = fse.readJsonSync('custom_src/panacloudConfig.json')


  let prevLambdas = Object.keys(configPanacloud.lambdas)

  let panacloudConfigNew = configPanacloud;

  let difference = newLambdas
    .filter(val => !prevLambdas.includes(val))
    .concat(prevLambdas.filter(val => !newLambdas.includes(val)));

  for (let diff of difference) {

    if (newLambdas.includes(diff)) {
      panacloudConfigNew.lambdas[diff] = {} as PanacloudConfiglambdaParams
      panacloudConfigNew.lambdas[diff].asset_path = `lambda/${diff}/index.ts`

    }
    else {
      delete panacloudConfigNew.lambdas[diff];

    }
  }

  fse.removeSync('custom_src/panacloudConfig.json')

  await fse.writeJson(`./custom_src/panacloudconfig.json`, panacloudConfigNew, (err: string) => {
    if (err) {
      stopSpinner(spinner, `Error: ${err}`, true);
      process.exit(1);
    }
  });


};
