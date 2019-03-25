import { parse } from "./core";

test("parses a query", () => {
  const nodes = parse<{ age: number }, {}>`
    SELECT first_name, last_name, age FROM table
    WHERE first_name = ${"Gal"}
    AND age = ${x => x.age}
  `;

  expect(nodes).toMatchSnapshot();
});

test("composes correctly", () => {
  const allUsers = parse<{}, {}>`
    SELECT * FROM users
  `;
  const nodes = parse<{}, {}>`
    SELECT * FROM (${allUsers}) all_users;
  `;
  expect(nodes).toMatchSnapshot();
});
