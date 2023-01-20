// @ts-expect-error TS(2451): Cannot redeclare block-scoped variable 'keccak256'... Remove this comment to see the full error message
const keccak256 = require("keccak256");
// @ts-expect-error TS(2451): Cannot redeclare block-scoped variable 'fs'.
const fs = require("fs");
// @ts-expect-error TS(2451): Cannot redeclare block-scoped variable 'chalk'.
const chalk = require("chalk");
// @ts-expect-error TS(2451): Cannot redeclare block-scoped variable 'path'.
const path = require("path");
// @ts-expect-error TS(2451): Cannot redeclare block-scoped variable 'isLocal'.
const isLocal = typeof process.pkg === "undefined";
// @ts-expect-error TS(2451): Cannot redeclare block-scoped variable 'basePath'.
const basePath = isLocal ? process.cwd() : path.dirname(process.execPath);

// @ts-expect-error TS(2451): Cannot redeclare block-scoped variable 'buildDir'.
const { buildDir } = require(path.join(basePath, "/src/config.js"));
// Read files from the build folder defined in config.
// @ts-expect-error TS(2451): Cannot redeclare block-scoped variable 'metadata'.
const metadata = JSON.parse(
  fs.readFileSync(path.join(buildDir, `/json/_metadata.json`), "utf-8")
);

const accumulatedHashString = metadata.reduce((acc: any, item: any) => {
  return acc.concat(item.imageHash);
}, []);

const provenance = keccak256(accumulatedHashString.join("")).toString("hex");

fs.writeFileSync(
  `${buildDir}/_provenance.json`,
  JSON.stringify(
    { provenance, concatenatedHashString: accumulatedHashString.join("") },
    null,
    "\t"
  )
);

console.log(`\nProvenance Hash Save in !\n${buildDir}/_provenance.json\n`);
console.log(chalk.greenBright.bold(`${provenance} \n`));
