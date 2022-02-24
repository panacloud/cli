import {
  ToDo,
  MutationCreateToDoArgs,
  MutationUpdateToDoArgs,
  MutationDeleteToDoArgs,
  QueryGetToDoArgs,
} from "../types";

export type TestCollection = {
  fields: { deleteToDos: { arguments: {}; response: ToDo[] }[] };
};
