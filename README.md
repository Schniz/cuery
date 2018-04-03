# Cuery - Composable SQL Querying ![build status](https://travis-ci.org/Schniz/cuery.svg?branch=master)

> A composable SQL query builder based inspired by
> [styled-components :nail_care:](https://styled-components.com) :sparkles:

In 2016, I wrote a blog post about
[composing SQL queries](https://medium.com/@galstar/composable-sql-in-javascript-db51d9cae017)
and published this library as a reference. The years passed, and there are much
cooler ways of doing it, so this is the new way - using template literals.

# Installation

```bash
yarn add cuery pg
# or
npm install --save cuery pg
```

# Usage

```js
import { sql, execute } from "cuery";

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
    FROM (${query}) limited_query_${Math.floor(Math.random() * 100000)}
    LIMIT ${p => p.limit}
    OFFSET ${p => p.offset}
  `;

// then you can just compose your queries!

const users = sql`SELECT * FROM users`;
const usersWithLimit = users.compose(limit); // or limit(users)
execute(usersWithLimit, { limit: 10, offset: 10 }); // start with offset of 10, then take 10 records.
```

# Running tests

* set the `DATABASE_URL` env variable for your PostgreSQL server - defaults to
  `node-postgres`' default
* `yarn test`
