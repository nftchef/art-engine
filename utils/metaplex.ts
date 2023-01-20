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

const {
  creators,
  // @ts-expect-error TS(2451): Cannot redeclare block-scoped variable 'descriptio... Remove this comment to see the full error message
  description,
  external_url,
  NFTName,
  royaltyFee,
  symbol,
// @ts-expect-error TS(2580): Cannot find name 'require'. Do you need to install... Remove this comment to see the full error message
} = require(path.join(basePath, "/Solana/solana_config.js"));
// @ts-expect-error TS(2451): Cannot redeclare block-scoped variable 'startIndex... Remove this comment to see the full error message
const { startIndex, outputJPEG } = require(path.join(
  basePath,
  "/src/config.js"
));
// @ts-expect-error TS(2451): Cannot redeclare block-scoped variable 'imagesDir'... Remove this comment to see the full error message
const imagesDir = `${basePath}/build/images`;
// @ts-expect-error TS(2451): Cannot redeclare block-scoped variable 'jsonDir'.
const jsonDir = `${basePath}/build/json`;

const metaplexFilePath = `${basePath}/build/solana`;
const metaplexDir = `${basePath}/build/solana`;

// @ts-expect-error TS(2451): Cannot redeclare block-scoped variable 'setup'.
const setup = () => {
  if (fs.existsSync(metaplexFilePath)) {
    fs.rmSync(metaplexFilePath, {
      recursive: true,
    });
  }
  fs.mkdirSync(metaplexFilePath);
  fs.mkdirSync(path.join(metaplexFilePath, "/json"));
  if (startIndex != 0) {
    fs.mkdirSync(path.join(metaplexFilePath, "/images"));
  }
};

// @ts-expect-error TS(2451): Cannot redeclare block-scoped variable 'getIndivid... Remove this comment to see the full error message
const getIndividualImageFiles = () => {
  return fs.readdirSync(imagesDir);
};

// @ts-expect-error TS(2451): Cannot redeclare block-scoped variable 'getIndivid... Remove this comment to see the full error message
const getIndividualJsonFiles = () => {
  return fs
    .readdirSync(jsonDir)
    .filter((item: any) => /^[0-9]{1,6}.json/g.test(item));
};

setup();
console.log(chalk.bgGreenBright.black("Beginning Solana/Metaplex conversion"));
console.log(
  chalk.green(
    `\nExtracting metaplex-ready files.\nWriting to folder: ${metaplexFilePath}`
  )
);

const outputFormat = outputJPEG ? "jpg" : "png";
// copy & rename images IF needed
// Rename all image files to n-1.png (to be zero indexed "start at zero") and store in solana/images
if (startIndex != 0) {
  const imageFiles = getIndividualImageFiles();
  imageFiles.forEach((file: any) => {
    let nameWithoutExtension = file.slice(0, -4);
    let editionCountFromFileName = Number(nameWithoutExtension);
    let newEditionCount = editionCountFromFileName - startIndex;
    fs.copyFile(
      `${imagesDir}/${file}`,
      path.join(
        `${metaplexDir}`,
        "images",
        `${newEditionCount}.${outputFormat}`
      ),
      () => {}
    );
  });
  console.log(`\nFinished converting images to being metaplex-ready.\n`);
}

// Identify json files
// @ts-expect-error TS(2451): Cannot redeclare block-scoped variable 'jsonFiles'... Remove this comment to see the full error message
const jsonFiles = getIndividualJsonFiles();
console.log(
  chalk.green(`Found ${jsonFiles.length} json files in "${jsonDir}" to process`)
);

// Iterate, open and put in metadata list
jsonFiles.forEach((file: any) => {
  let nameWithoutExtension = file.slice(0, -4);
  let editionCountFromFileName = Number(nameWithoutExtension);
  let newEditionCount = editionCountFromFileName - startIndex;

  const rawData = fs.readFileSync(`${jsonDir}/${file}`);
  const jsonData = JSON.parse(rawData);

  let tempMetadata = {
    name: NFTName + " " + jsonData.name,
    symbol: symbol,
    description: description,
    seller_fee_basis_points: royaltyFee,
    image: `${newEditionCount}.${outputFormat}`,
    ...(external_url !== "" && { external_url }),
    attributes: jsonData.attributes,
    properties: {
      edition: jsonData.edition,
      files: [
        {
          uri: `${newEditionCount}.${outputFormat}`,
          type: `image/${outputFormat}`,
        },
      ],
      category: "image",
      creators: creators,
      compiler: "HashLips Art Engine - NFTChef fork | qualifieddevs.io",
    },
  };
  fs.writeFileSync(
    path.join(`${metaplexDir}`, "json", `${newEditionCount}.json`),
    JSON.stringify(tempMetadata, null, 2)
  );
});
console.log(
  `\nFinished converting json metadata files to being metaplex-ready.`
);
console.log(chalk.green(`\nConversion was finished successfully!\n`));
