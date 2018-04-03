import sql from "./sql";

it("it builds a query object", () => {
  const result = sql`select * from users where id = ${'some id'}`;
  expect(result).toMatchSnapshot();
});

it("composes", () => {
  const first = sql`select * from users where id = ${'first query param'}`;
  const withName = sql`select * from (${first}) where name = ${'second query param'}`;
  const onlyFirstWithName = sql`select * from (${withName}) limit 1`;
  expect(onlyFirstWithName).toMatchSnapshot();
})
