import {
  User,
  MutationAddUserArgs,
  MutationDeleteUserArgs,
  QueryUserArgs,
} from "../types";

export type TestCollection = {
  fields: { addUser: { arguments: MutationAddUserArgs; response: User }[] };
};
