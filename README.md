# Cuery - Composable SQL Querying [![CircleCI status](https://circleci.com/gh/Schniz/cuery.svg?style=svg)](https://circleci.com/gh/Schniz/cuery)

> A composable SQL query builder based inspired by
> [styled-components :nail_care:](https://styled-components.com) :sparkles:

:dancer: Replace weird `$1` or `?` in your queries with simple functions!

:star: PostgreSQL and MySQL support!

:lock: Type safety (and autocompletion) with TypeScript

## Why

In 2016, I wrote a blog post about
[composing SQL queries](https://medium.com/@galstar/composable-sql-in-javascript-db51d9cae017)
and published this library as a reference. The years passed, and there are much
cooler ways of doing it, so this is the new way - using template literals.

# Installation

For PostgreSQL users:

```bash
yarn add cuery pg
# or
npm install --save cuery pg
```

For MySQL users:

```bash
yarn add cuery mysql
# or
npm install --save cuery mysql
```

# API

Import the modules for the database you use:

- `cuery/pg` for PostgreSQL
- `cuery/mysql` for MySQL

Both modules export the same two basic functions:

### `sql<Input, Output>` template literal

The `sql<Input, Output>` template literal is meant for constructing an SQL query. It accepts functions, that will be acted as "getters" from the object you supply to the execute function, and compose other SQL queries too.

The two generics are meant for type safety, so you would declare your input and output types co-located with your query, just like a function: `(input: Input) => Output`.

It returns an SQL query, that later can be `execute`d with the options needed, such as a `pool` (or a `connection` in MySQL)

```ts
const returnsNumber = sql<
  {}, // Takes no parameters as input
  { age: number }
>` // Returns a number as output
  SELECT 27 AS age
`;

const takesNumberAndReturnsIt = sql<
  { age: number }, // Takes a number as input
  { age: number }
>` // Returns a number as output
  SELECT ${p => p.age} AS age
`;

(await takesNumberAndReturnsIt.execute({ age: 27 }, { pool: new Pg.Pool() }))[0]
  .age === 27;
```

### `createSqlWithDefaults(defaults)`

This function returns an `sql<Input, Output>` template literal function, that defaults to a specific execute options.
Normally, it would be stored in a specific file in your project, that contains the information about the database connection, so you won't need to pass it all around your application.

```ts
const sql = createSqlWithDefaults({ pool: new Pg.Pool() });
const query = sql<{}, { age: number }>`SELECT 27 AS age`;
(await query.execute({}))[0].age === 27;
```

### `raw`

This function is a helper function to say that the primitive passed into this function should be stringified and be added "as is" to the query. This is unsafe by nature, but when used correctly can have good implications like generating table names.

```ts
sql<{}, {}>`SELECT 27 AS ${raw("age")}`;
```

# Usage

### PostgreSQL

```ts
import { sql } from "cuery/pg";

const usersQuery = sql`SELECT name, age FROM users`;
const usersWithNameQuery = sql<{ name: string }, { name: string; age: number }>`
  SELECT name, age FROM (${usersQuery})
  WHERE name = ${params => params.name}
`;

// pool = new Pg.Pool()

const rows = await usersWithNameQuery.execute({ name: "John" }, { pool });
rows[0].age; // Type safe!
```

### MySQL

```ts
import { sql } from "cuery/mysql";

const usersQuery = sql`SELECT name, age FROM users`;
const usersWithNameQuery = sql<{ name: string }, { name: string; age: number }>`
  SELECT name, age FROM (${usersQuery})
  WHERE name = ${params => params.name}
`;

// connection = create a new mysql connection

const rows = await usersWithNameQuery.execute({ name: "John" }, { connection });
rows[0].age; // Type safe!
```

## Transformations

You can declare helper methods that do magic on your queries, like `limit`:

```ts
function limit<Input, Output>(query: Query<Input, Output>) {
  return sql<Input & { limit: Number; offset: Number }, Output>`
    SELECT *
    FROM (${query}) LIMITED__QUERY__${raw(Math.floor(Math.random() * 99999))}
    LIMIT ${p => p.limit}
    OFFSET ${p => p.offset}
  `;
}

// then you can just compose your queries!

const users = sql<
  {},
  { name: string; age: number }
>`SELECT name, age FROM users`;
const usersWithLimit = limit(users);
execute(usersWithLimit, { limit: 10, offset: 10 }); // start with offset of 10, then take 10 records.
```

# Running tests

```bash
docker run --rm -d -p 5432:5432 -e POSTGRES_PASSWORD=password postgres:10
docker run --rm -d -p 3306:3306 -e MYSQL_ROOT_PASSWORD=password mysql:5.7
npm test
```
