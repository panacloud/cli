import {
  ToDo,
  MutationCreateToDoArgs,
  MutationUpdateToDoArgs,
  MutationDeleteToDoArgs,
  QueryGetToDoArgs,
} from "../types";

export type TestCollection = {
  fields: { getToDo: { arguments: QueryGetToDoArgs; response: ToDo }[] };
};
