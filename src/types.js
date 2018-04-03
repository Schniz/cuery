// @flow

import { Pool } from "pg";

export type SqlParameter = number | string;
export type SqlFunctionParameter = (p: *) => SqlParameter;
export type QueryMeta = {
  query: string,
  params: Array<SqlFunctionParameter>,
};

export type QueryExecuteOptions = {
  pool?: Pool,
};
