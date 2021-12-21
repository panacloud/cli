import { User, MutationAddUserArgs, QueryUserArgs } from "../../../../types";

export type TestCollection = {
  fields: { addUser: { arguments: MutationAddUserArgs; response: User }[] };
};
