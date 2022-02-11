import {
  Todo,
  MutationAddTodoArgs,
  MutationUpdateTodoArgs,
  MutationDeleteTodoArgs,
} from "../types";

export type TestCollection = {
  fields: { getTodos: { arguments: {}; response: Todo[] }[] };
};
