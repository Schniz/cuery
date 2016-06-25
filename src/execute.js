// @flow

/**
 * This file exposes the `execute` method, which receives a Query and a params object.
 */

import Query from './Query';
import pg from 'pg';

/**
 * Connects to the database. as a promise.
 */
export function connect(connString : any) : Promise {
  return new Promise((resolve, reject) => {
    pg.connect(connString, (err, conn, done) => {
      if (err) return reject(err);
      conn.done = done;
      return resolve(conn);
    });
  });
}

/**
 * Takes a list of keys and an object and puts all the values in the right order
 *
 * @param {Array<string>} params the query parameter names i.e. [ 'firstName', 'age' ]
 * @param {Object} paramsObject  the parameters sent to the query i.e. { firstName: 'gal', age: 24 }
 * @returns {Array<any>} a list with the right order i.e. [ 'gal', 24 ]
 */
function createParamsArray(params : Array<string>, paramsObject : { [key:string]: any }) : Array<any> {
  return params.map(param => {
    const value = paramsObject[param];
    if (typeof value === 'undefined') console.log(`WARNING: an undefined ${param} passed to query. I hope you know what you are doing.`); // eslint-disable-line
    return value;
  });
}

/**
 * Execute a pg-query and return a promise
 */
export function doQuery(conn : any, query : any, params : any) : Promise {
  return new Promise((resolve, reject) => {
    conn.query(query, params, (err, results) => {
      if (err) return reject(err);
      conn.done();
      return resolve(results);
    });
  });
}

/**
 * Executes a `Query` with the provided `params`.
 *
 * @param {Query} query we need to execute.
 * @param {Object} params the query parameters.
 * @returns {Promise<PGResult>} a promise with `node-pg` results.
 */
export function execute(
  query : Query,
  params: { [key: string]: any },
  connString? : any = process.env.DATABASE_URL,
) : Promise<any> {
  return connect(connString).then(conn => {
    const queryData = query.queryData;
    const pgParams = createParamsArray(queryData.params, params);
    return doQuery(conn, queryData.query, pgParams);
  });
}

export default execute;
