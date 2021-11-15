import {
  User,
  MutationAddUserArgs,
  MutationDeleteUserArgs,
  QueryUserArgs,
} from "../types";

export type TestCollection = {
  fields: { user: { arguments: QueryUserArgs; response: User }[] };
};
