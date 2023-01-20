"use strict";

// @ts-expect-error TS(2451): Cannot redeclare block-scoped variable 'isLocal'.
const isLocal = typeof process.pkg === "undefined";
// @ts-expect-error TS(2451): Cannot redeclare block-scoped variable 'basePath'.
const basePath = isLocal ? process.cwd() : path.dirname(process.execPath);
// @ts-expect-error TS(2451): Cannot redeclare block-scoped variable 'fs'.
const fs = require("fs");
// @ts-expect-error TS(2451): Cannot redeclare block-scoped variable 'path'.
const path = require("path");
// @ts-expect-error TS(2451): Cannot redeclare block-scoped variable 'jsonDir'.
const jsonDir = `${basePath}/build/json`;
// @ts-expect-error TS(2451): Cannot redeclare block-scoped variable 'metadataFi... Remove this comment to see the full error message
const metadataFilePath = `${basePath}/build/json/_metadata.json`;

// @ts-expect-error TS(2451): Cannot redeclare block-scoped variable 'getIndivid... Remove this comment to see the full error message
const getIndividualJsonFiles = () => {
  return fs
    .readdirSync(jsonDir)
    .filter((item: any) => /^[0-9]{1,6}.json/g.test(item));
};

// Identify json files
// @ts-expect-error TS(2451): Cannot redeclare block-scoped variable 'jsonFiles'... Remove this comment to see the full error message
const jsonFiles = getIndividualJsonFiles();
console.log(`Found ${jsonFiles.length} json files in "${jsonDir}" to process`);

// Iterate, open and put in metadata list
// @ts-expect-error TS(2451): Cannot redeclare block-scoped variable 'metadata'.
const metadata = jsonFiles
  .map((file: any) => {
    const rawdata = fs.readFileSync(`${jsonDir}/${file}`);
    return JSON.parse(rawdata);
  })
  .sort((a: any, b: any) => parseInt(a.edition) - parseInt(b.edition));

console.log(
  `Extracted and sorted metadata files. Writing to file: ${metadataFilePath}`
);
fs.writeFileSync(metadataFilePath, JSON.stringify(metadata, null, 2));
