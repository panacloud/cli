import { ToDo, MutationCreateToDoArgs, MutationDeleteToDoArgs } from "../types";

export type TestCollection = {
  fields: { getToDos: { arguments: {}; response: ToDo[] }[] };
};
