import { CodeMaker } from "codemaker";
import { Property } from "../../../../../utils/typescriptWriter";
let maker = new CodeMaker();

export const auroradbPropertiesInitializer = (apiName: string) => {
  maker.line(`this.serviceRole = ${apiName}Lambda_serviceRole;`);
  maker.line(`this.vpcRef = ${apiName}_vpc;`);
  maker.line(`this.secretRef = ${apiName}_secret`);
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
