import { User, MutationAddUserArgs, QueryUserArgs } from "../types";

export type TestCollection = {
  fields: { user: { arguments: QueryUserArgs; response: User }[] };
};
