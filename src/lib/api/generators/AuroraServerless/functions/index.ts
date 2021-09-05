import { CodeMaker } from "codemaker";
import { Property } from "../../../../../utils/typescriptWriter";

export const auroradbPropertiesInitializer = (apiName: string,code:CodeMaker) => {
  code.line(`this.serviceRole = ${apiName}Lambda_serviceRole;`);
  code.line(`this.vpcRef = ${apiName}_vpc;`);
  code.line(`this.secretRef = ${apiName}_secret`);
};

export const auroradbPropertiesHandler = (): Property[] => {
  return [
    {
      name: "secretRef",
      typeName: "string",
      accessModifier: "public",
    },
    {
      name: "vpcRef",
      typeName: "ec2.Vpc",
      accessModifier: "public",
    },
    {
      name: "serviceRole",
      typeName: "iam.Role",
      accessModifier: "public",
    },
  ];
};
