import {
  User,
  MutationAddUserArgs,
  MutationDeleteUserArgs,
  QueryUserArgs,
} from "../types";

export type TestCollection = {
  fields: {
    deleteUser: { arguments: MutationDeleteUserArgs; response: User }[];
  };
};
