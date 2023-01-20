"use strict";
/**
 * Cardono util is build to conform to the specifications and workflow
 * for NFTMaker Pro.
 *
 * The policy_id, image location, and other values are left in the
 * placeholder form, e.g., <policy_id>
 * The actual values are replaced dynamically by NFTmakerPro.
 *
 *
 */
// @ts-expect-error TS(2451): Cannot redeclare block-scoped variable 'fs'.
const fs = require("fs");
// @ts-expect-error TS(2451): Cannot redeclare block-scoped variable 'path'.
const path = require("path");
// @ts-expect-error TS(2451): Cannot redeclare block-scoped variable 'isLocal'.
const isLocal = typeof process.pkg === "undefined";
// @ts-expect-error TS(2451): Cannot redeclare block-scoped variable 'basePath'.
const basePath = isLocal ? process.cwd() : path.dirname(process.execPath);
// @ts-expect-error TS(2451): Cannot redeclare block-scoped variable 'chalk'.
const chalk = require("chalk");

// const imagesDir = `${basePath}/build/images`;
// @ts-expect-error TS(2451): Cannot redeclare block-scoped variable 'jsonDir'.
const jsonDir = `${basePath}/build/json`;

// @ts-expect-error TS(2451): Cannot redeclare block-scoped variable 'metadataBu... Remove this comment to see the full error message
const metadataBuildPath = `${basePath}/build/cardano`;
// @ts-expect-error TS(2451): Cannot redeclare block-scoped variable 'metadataCo... Remove this comment to see the full error message
const metadataConfigPath = `${basePath}/build/cardano`;

// @ts-expect-error TS(2451): Cannot redeclare block-scoped variable 'setup'.
const setup = () => {
  if (fs.existsSync(metadataBuildPath)) {
    fs.rmSync(metadataBuildPath, {
      recursive: true,
    });
  }
  fs.mkdirSync(metadataBuildPath);
  fs.mkdirSync(path.join(metadataBuildPath, "/metadata"));
};

// @ts-expect-error TS(2451): Cannot redeclare block-scoped variable 'getIndivid... Remove this comment to see the full error message
const getIndividualJsonFiles = () => {
  return fs
    .readdirSync(jsonDir)
    .filter((item: any) => /^[0-9]{1,6}.json/g.test(item));
};

setup();
console.log(chalk.cyan.black("Beginning Cardano conversion"));
console.log(
  chalk.cyan(`\nExtracting files.\nWriting to folder: ${metadataBuildPath}`)
);

// Identify json files
// @ts-expect-error TS(2451): Cannot redeclare block-scoped variable 'jsonFiles'... Remove this comment to see the full error message
const jsonFiles = getIndividualJsonFiles();
console.log(
  chalk.cyan(`Found ${jsonFiles.length} json files in "${jsonDir}" to process`)
);

// Iterate, open and put in metadata list
jsonFiles.forEach((file: any) => {
  let nameWithoutExtension = file.slice(0, -4);
  let editionCountFromFileName = Number(nameWithoutExtension);

  const rawData = fs.readFileSync(`${jsonDir}/${file}`);
  const jsonData = JSON.parse(rawData);

  // convert the array of attributes into a flat object
  // this object is spread into the metadata template
  const restructuredAttributes = {};
  jsonData.attributes.map((attr: any) => {
    // @ts-expect-error TS(7053): Element implicitly has an 'any' type because expre... Remove this comment to see the full error message
    restructuredAttributes[attr.trait_type] = attr.value;
  }, []);

  let metadataTemplate = {
    721: {
      "<policy_id>": {
        "<asset_name>": {
          name: jsonData.name,
          image: "<ipfs_link>",
          mediaType: "<mime_type>",
          description: jsonData.description,
          files: [
            {
              name: "<display_name>",
              mediaType: "<mime_type>",
              src: "<ipfs_link>",
            },
          ],
          ...restructuredAttributes,
        },
      },
      version: "1.0",
    },
  };
  fs.writeFileSync(
    path.join(
      `${metadataConfigPath}`,
      "metadata",
      `${editionCountFromFileName}.metadata`
    ),
    JSON.stringify(metadataTemplate, null, 2)
  );
});
console.log(`\nFinished converting json metadata files to Cardano Format.`);
console.log(chalk.green(`\nConversion was finished successfully!\n`));
