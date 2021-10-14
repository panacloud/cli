const fse = require("fs-extra");

import { ApiModel } from "../../utils/constants";
import { ARCHITECTURE, PanacloudconfigFile, PanacloudConfiglambdaParams } from "../../utils/constants";
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
  model:ApiModel
) => {
  const {api:{mutationFields,queiresFields,architecture,schemaTypes,nestedResolver}} = model;
  let mutationsAndQueries: string[] = [...queiresFields!, ...mutationFields!];
  let configJson: PanacloudconfigFile = { lambdas: {} };
  
  mutationsAndQueries.forEach((key: string) => {
    const lambdas = configJson.lambdas[key] = {} as PanacloudConfiglambdaParams
    lambdas.asset_path = `mock_lambda/${key}/index.ts`;
  });

  if (architecture === ARCHITECTURE.eventDriven) {
    mutationFields!.forEach((key: string) => {
      key = `${key}_consumer`;
      const lambdas = configJson.lambdas[key] = {} as PanacloudConfiglambdaParams
      lambdas.asset_path = `consumer_lambda/${key}/index.ts`;
    });
  }

  if(nestedResolver){
    schemaTypes!.forEach((key: string) => {
      const lambdas = configJson.lambdas[key] = {} as PanacloudConfiglambdaParams
      lambdas.asset_path = `mock_lambda/${key}/index.ts`;
    });
  }

  await fse.writeJson(`./editable_src/panacloudconfig.json`, configJson);

  return configJson;
};

export const updatePanacloudConfig = async (
  model:ApiModel,
  spinner: any,
) => {

  const {api:{queiresFields,mutationFields,architecture,nestedResolver,schemaTypes}} = model

  let newLambdas: string[] = [...queiresFields!, ...mutationFields!];

  if (architecture === ARCHITECTURE.eventDriven) {
    mutationFields!.forEach((key: string) => {
      key = `${key}_consumer`;
      newLambdas = [...newLambdas, key]
    });
  }

  if (nestedResolver) {
    schemaTypes!.forEach((key: string) => {
      key = `${key}`;
      newLambdas = [...newLambdas, key]
    });
  }

  const configPanacloud: PanacloudconfigFile = fse.readJsonSync('editable_src/panacloudconfig.json')
  let prevLambdas = Object.keys(configPanacloud.lambdas)

  let panacloudConfigNew = configPanacloud;

  let difference = newLambdas
    .filter(val => !prevLambdas.includes(val))
    .concat(prevLambdas.filter(val => !newLambdas.includes(val)));

  for (let diff of difference) {
    if (newLambdas.includes(diff)) {
      panacloudConfigNew.lambdas[diff] = {} as PanacloudConfiglambdaParams
      panacloudConfigNew.lambdas[diff].asset_path = `mock_lambda/${diff}/index.ts`

    }
    else {
      delete panacloudConfigNew.lambdas[diff];
    }
  }

  fse.removeSync('editable_src/panacloudconfig.json')
  fse.writeJson(`./editable_src/panacloudconfig.json`, panacloudConfigNew, (err: string) => {
    if (err) {
      stopSpinner(spinner, `Error: ${err}`, true);
      process.exit(1);
    }
  });

  return panacloudConfigNew;

};
