export type Maybe<T> = T | null;
export type InputMaybe<T> = Maybe<T>;
export type Exact<T extends { [key: string]: unknown }> = {
  [K in keyof T]: T[K];
};
export type MakeOptional<T, K extends keyof T> = Omit<T, K> & {
  [SubKey in K]?: Maybe<T[SubKey]>;
};
export type MakeMaybe<T, K extends keyof T> = Omit<T, K> & {
  [SubKey in K]: Maybe<T[SubKey]>;
};
/** All built-in and custom scalars, mapped to their actual values */
export interface Scalars {
  ID: string;
  String: string;
  Boolean: boolean;
  Int: number;
  Float: number;
  AWSDate: any;
  AWSDateTime: any;
  AWSEmail: any;
  AWSIPAddress: any;
  AWSJSON: any;
  AWSPhone: any;
  AWSTime: any;
  AWSTimestamp: any;
  AWSURL: any;
}

export interface Mutation {
  __typename?: "Mutation";
  addUser: User;
}

export interface MutationAddUserArgs {
  name: Scalars["String"];
}

export interface Query {
  __typename?: "Query";
  user?: Maybe<User>;
}

export interface QueryUserArgs {
  id?: InputMaybe<Scalars["String"]>;
}

export interface User {
  __typename?: "User";
  id: Scalars["String"];
  name?: Maybe<Scalars["String"]>;
}
