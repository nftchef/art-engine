"use strict";

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

// @ts-expect-error TS(2451): Cannot redeclare block-scoped variable 'tezosConfi... Remove this comment to see the full error message
const tezosConfig = require(path.join(basePath, "/Tezos/tezos_config.js"));

// @ts-expect-error TS(2451): Cannot redeclare block-scoped variable 'jsonDir'.
const jsonDir = `${basePath}/build/json`;

// @ts-expect-error TS(2451): Cannot redeclare block-scoped variable 'metadataBu... Remove this comment to see the full error message
const metadataBuildPath = `${basePath}/build/tezos`;
// @ts-expect-error TS(2451): Cannot redeclare block-scoped variable 'metadataCo... Remove this comment to see the full error message
const metadataConfigPath = `${basePath}/build/tezos`;

// @ts-expect-error TS(2451): Cannot redeclare block-scoped variable 'setup'.
const setup = () => {
  if (fs.existsSync(metadataBuildPath)) {
    fs.rmSync(metadataBuildPath, {
      recursive: true,
    });
  }
  fs.mkdirSync(metadataBuildPath);
  fs.mkdirSync(path.join(metadataBuildPath, "/json"));
};

// @ts-expect-error TS(2451): Cannot redeclare block-scoped variable 'getIndivid... Remove this comment to see the full error message
const getIndividualJsonFiles = () => {
  return fs
    .readdirSync(jsonDir)
    .filter((item: any) => /^[0-9]{1,6}.json/g.test(item));
};

setup();
console.log(chalk.cyan.black("Beginning Tezos conversion"));
console.log(
  chalk.cyan(`\nExtracting files.\nWriting to folder: ${metadataBuildPath}`)
);

// Iterate, open and put in metadata list
// @ts-expect-error TS(2451): Cannot redeclare block-scoped variable 'jsonFiles'... Remove this comment to see the full error message
const jsonFiles = getIndividualJsonFiles();

const stringifySize = (obj: any) => {
  return `${obj.width}x${obj.height}`;
};
const metadatas: any = [];
jsonFiles.forEach((file: any) => {
  let nameWithoutExtension = file.slice(0, -4);
  let editionCountFromFileName = Number(nameWithoutExtension);

  const rawData = fs.readFileSync(`${jsonDir}/${file}`);
  const jsonData = JSON.parse(rawData);

  const restructuredAttributes = jsonData.attributes.reduce(
    (properties: any, attr: any) => {
      return [...properties, { name: attr.trait_type, value: attr.value }];
    },
    []
  );

  let tempMetadata = {
    edition: jsonData.edition,
    name: jsonData.name,
    description: jsonData.description,
    artifactUri: jsonData.image,
    displayUri: `${tezosConfig.baseDisplayUri}/${jsonData.edition}.png`,
    thumbnailUri: `${tezosConfig.baseThumbnailUri}/${jsonData.edition}.png`,
    decimals: tezosConfig.decimals,
    creators: tezosConfig.creators,
    isBooleanAmount: tezosConfig.isBooleanAmount,
    symbol: tezosConfig.symbol,
    rights: tezosConfig.rights,
    shouldPreferSymbol: tezosConfig.shouldPreferSymbol,

    attributes: [...restructuredAttributes],

    // Defining formats
    formats: [
      {
        mimeType: "image/png",
        uri: jsonData.image,
        dimensions: {
          value: stringifySize(tezosConfig.size.artifactUri),
          unit: "px",
        },
      },
      {
        mimeType: "image/png",
        uri: `${tezosConfig.baseDisplayUri}/${jsonData.edition}.png`,
        dimensions: {
          value: stringifySize(tezosConfig.size.displayUri),
          unit: "px",
        },
      },
      {
        mimeType: "image/png",
        uri: `${tezosConfig.baseThumbnailUri}/${jsonData.edition}.png`,
        dimensions: {
          value: stringifySize(tezosConfig.size.thumbnailUri),
          unit: "px",
        },
      },
    ],

    royalties: {
      decimals: 3,
      shares: tezosConfig.royalties,
    },
  };
  fs.writeFileSync(
    path.join(
      `${metadataConfigPath}`,
      "json",
      `${editionCountFromFileName}.json`
    ),
    JSON.stringify(tempMetadata, null, 2)
  );
  metadatas.push(tempMetadata);
});

fs.writeFileSync(
  path.join(`${metadataConfigPath}`, "json", `_metadata.json`),
  JSON.stringify(metadatas, null, 2)
);
console.log(`\nFinished converting json metadata files to Tezos Format.`);
console.log(chalk.green(`\nConversion was finished successfully!\n`));
