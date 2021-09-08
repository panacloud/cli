import { ApiModel } from "../../../utils/constants";

export const generator = (model: ApiModel) => {
  console.log(model.api.schema);
};
