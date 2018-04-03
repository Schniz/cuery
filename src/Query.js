// @flow

import { type QueryMeta } from "./types";
import execute from './execute';

export default class Query {
  queryMeta: QueryMeta;

  constructor(queryMeta: QueryMeta) {
    this.queryMeta = queryMeta;
  }

  getParamsArray(args: *) {
    return this.queryMeta.params.map(fn => {
      if (typeof fn === "function") {
        return fn(args);
      }
      return fn;
    });
  }

  map(fn: QueryMeta => QueryMeta) {
    return new Query(fn(this.queryMeta));
  }

  compose(fn: Query => Query) {
    return fn(this);
  }
}
