// @flow
import type Query from "./Query";
import { type SqlParameter, type QueryExecuteOptions } from "./types";
import { Pool } from "pg";

let defaultPool: Pool = null;

const poolOrDefault = (pool): Pool => {
  if (pool) return pool;
  if (!defaultPool) defaultPool = new Pool();
  return defaultPool;
};

const connect = (pool): Promise<{| client: any, done: Function |}> => {
  return new Promise((resolve, reject) => {
    pool.connect((err, client, done) => {
      if (err) return reject(err);
      resolve({ client, done });
    });
  });
};

export default (
  query: Query,
  args: { [key: string]: SqlParameter },
  { pool }: QueryExecuteOptions = {}
): Promise<any> => {
  return connect(poolOrDefault(pool)).then(({ client, done }) => {
    return client
      .query(query.queryMeta.query, query.getParamsArray(args))
      .then(res => {
        done();
        res.rows.raw = res;
        return res.rows;
      });
  });
};
