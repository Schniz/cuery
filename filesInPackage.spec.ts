import { spawnSync } from "child_process";

test("Files that will be published to the repo", () => {
  const result = spawnSync("npm", ["pack", "--dry-run"], { encoding: "utf8" });
  const lines = result.stderr.split("\n");
  const begin = lines.findIndex(line => line.includes("Tarball Contents"));
  const end = lines.findIndex(line => line.includes("Tarball Details"));
  const files = lines.slice(begin + 1, end).map(line => {
    return line.split(/\s+/)[3];
  });
  expect(files).toMatchSnapshot();
});
