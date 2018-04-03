# Cuery - Composable SQL Querying ![build status](https://travis-ci.org/Schniz/cuery.svg?branch=master)

A composable SQL query builder based on string literals and transformation
functions :sparkles:

# Installation

```bash
yarn add cuery pg
# or
npm install --save cuery pg
```

# Usage

```js
import { sql } from "cuery";

const usersQuery = sql`SELECT * FROM users`;
const usersWithNameQuery = sql`
  SELECT * FROM (${usersQuery})
  WHERE name = ${params => params.name}
`;

execute(usersWithNameQuery, { name: "John" }); // => Promise(<all the users named "John">)
```

## Transformations

You can declare helper methods that do magic on your queries, like `limit`:

```js
const limit = query =>
  sql`
    SELECT *
    FROM (${query}) limited_query
    LIMIT ${p => p.limit}
    OFFSET ${p => p.offset}
  `;

// then you can just compose your queries!

const users = sql`SELECT * FROM users`;
const usersWithLimit = users.compose(limit);
execute(usersWithLimit, { limit: 10, offset: 10 }); // start with offset of 10, then take 10 records.
```

# Running tests

* set the `DATABASE_URL` env variable for your PostgreSQL server - defaults to `node-postgres`' default
* `yarn test`
