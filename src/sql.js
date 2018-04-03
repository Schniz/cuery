// @flow

import Query from './Query';
import buildQueryString from "./buildQueryString";
import { type SqlFunctionParameter } from './types';

export default function sql(
  strings: Array<string>,
  ...functionsOrParameters: Array<SqlFunctionParameter | Query>
): Query {
  const query = buildQueryString(strings, functionsOrParameters);

  const params = functionsOrParameters.reduce((acc, curr) => {
    if (curr instanceof Query) {
      acc.push(...curr.queryMeta.params);
    } else {
      acc.push(curr);
    }
    return acc;
  }, []);

  return new Query({ query, params });
}
