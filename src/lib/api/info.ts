const fse = require("fs-extra");

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

  let configJson: any = {};
  mutationsAndQueries.forEach((key: string) => {
    configJson[key] = `lambda/${key}/index.ts`;
  });
  await fse.writeJson(`./custom_src/panacloudconfig.json`, configJson);
};
