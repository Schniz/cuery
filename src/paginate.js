// @flow

import type { QueryData } from './Query';

export default function paginate(queryData : QueryData) : QueryData {
  const limit = queryData.params.length + 1;
  const offset = limit + 1;
  const randomName = `paginated_${ Math.floor(Math.random() * 100000) }`;

  return {
    ...queryData,
    query: `SELECT "${randomName}".* FROM (${queryData.query}) "${randomName}" LIMIT $${limit} OFFSET $${offset}`,
    params: [...queryData.params, 'limit', 'offset'],
  };
}
