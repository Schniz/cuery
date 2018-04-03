import { execute, sql } from ".";
import { Pool } from "pg";

const pool = new Pool({ connectionString: process.env.DATABASE_URL });

it("executes queries", async () => {
  const numbersQuery = sql`
    SELECT CAST(${args => args.num} as INTEGER) as "num",
           UPPER(${args => args.msg}) as "shout"
  `;
  const result = await execute(
    numbersQuery,
    { num: 2, msg: "hello!" },
    { pool }
  );
  expect(result[0].num).toBe(2);
  expect(result[0].shout).toBe("HELLO!");
});

it("executes composed queries", async () => {
  const dataQuery = sql`
    SELECT *
    FROM (
      VALUES (1, 'Gal Schlezinger', 'galstar', true), (2, 'Dean Shub', 'deanshub', false)
    ) users(id, full_name, twitter_handle, is_most_gever)
  `;
  const geverUsers = sql`
    SELECT *
    FROM (${dataQuery}) gever_users
    WHERE is_most_gever = ${p => p.isMostGever}
  `;

  const result = await execute(geverUsers, { isMostGever: true }, { pool });
  expect(result.length).toBe(1);
  expect(result[0].twitter_handle).toBe("galstar");
});
