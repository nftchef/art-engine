// @ts-expect-error TS(6200): Definitions of the following identifiers conflict ... Remove this comment to see the full error message
"use strict";
/**
 * The regeneration util uses the output _dna.json file to "continue" the same
 * uniqueness check the main generator uses when running the inital generation.
 *
 * This util takes an id number and generates an _additional_ unique DNA sequence,
 * and replaces the existing image and json files of the same id.
 *
 * It is assumed that the item is being regenerated because of an issue with
 * the DNA (picked traits), and that DNA is left in the _dna.json file so
 * (while changes are low) that item is not recreated again.
 */

// @ts-expect-error TS(2451): Cannot redeclare block-scoped variable 'isLocal'.
const isLocal = typeof process.pkg === "undefined";
// @ts-expect-error TS(2451): Cannot redeclare block-scoped variable 'basePath'.
const basePath = isLocal ? process.cwd() : path.dirname(process.execPath);
// @ts-expect-error TS(2451): Cannot redeclare block-scoped variable 'fs'.
const fs = require("fs");
// @ts-expect-error TS(2451): Cannot redeclare block-scoped variable 'path'.
const path = require("path");
// @ts-expect-error TS(2451): Cannot redeclare block-scoped variable 'Command'.
const { Command } = require("commander");
// @ts-expect-error TS(2451): Cannot redeclare block-scoped variable 'program'.
const program = new Command();
// @ts-expect-error TS(2580): Cannot find name 'require'. Do you need to install... Remove this comment to see the full error message
const { createCanvas } = require("canvas");

// @ts-expect-error TS(2451): Cannot redeclare block-scoped variable 'chalk'.
const chalk = require("chalk");

// @ts-expect-error TS(2451): Cannot redeclare block-scoped variable 'jsonDir'.
const jsonDir = `${basePath}/build/json`;
// @ts-expect-error TS(2451): Cannot redeclare block-scoped variable 'imageDir'.
const imageDir = `${basePath}/build/images`;
// @ts-expect-error TS(2451): Cannot redeclare block-scoped variable 'dnaFilePat... Remove this comment to see the full error message
const dnaFilePath = `${basePath}/build/_dna.json`;
// @ts-expect-error TS(2451): Cannot redeclare block-scoped variable 'metadataFi... Remove this comment to see the full error message
const metadataFilePath = `${basePath}/build/json/_metadata.json`;

const {
  // @ts-expect-error TS(2451): Cannot redeclare block-scoped variable 'format'.
  format,
  // @ts-expect-error TS(2451): Cannot redeclare block-scoped variable 'background... Remove this comment to see the full error message
  background,
  // @ts-expect-error TS(2451): Cannot redeclare block-scoped variable 'uniqueDnaT... Remove this comment to see the full error message
  uniqueDnaTorrance,
  // @ts-expect-error TS(2451): Cannot redeclare block-scoped variable 'layerConfi... Remove this comment to see the full error message
  layerConfigurations,
  // @ts-expect-error TS(2451): Cannot redeclare block-scoped variable 'outputJPEG... Remove this comment to see the full error message
  outputJPEG,
  // @ts-expect-error TS(2451): Cannot redeclare block-scoped variable 'startIndex... Remove this comment to see the full error message
  startIndex,
// @ts-expect-error TS(2580): Cannot find name 'require'. Do you need to install... Remove this comment to see the full error message
} = require(path.join(basePath, "/src/config.js"));

const {
  createDna,
  DNA_DELIMITER,
  isDnaUnique,
  paintLayers,
  layersSetup,
  constructLayerToDna,
  loadLayerImg,
  addMetadata,
  postProcessMetadata,
// @ts-expect-error TS(2580): Cannot find name 'require'. Do you need to install... Remove this comment to see the full error message
} = require(path.join(basePath, "/src/main.js"));

let failedCount = 0;
let attributesList = [];
const canvas = createCanvas(format.width, format.height);
const ctxMain = canvas.getContext("2d");

const getDNA = () => {
  const flat = JSON.parse(fs.readFileSync(dnaFilePath));
  return flat.map((dnaStrand: any) => dnaStrand.split(DNA_DELIMITER));
  // .filter((item) => /^[0-9]{1,6}.json/g.test(item));
};

const createItem = (layers: any) => {
  let newDna = createDna(layers);
  const existingDna = getDNA();
  // @ts-expect-error TS(2554): Expected 1 arguments, but got 2.
  if (isDnaUnique(existingDna, newDna)) {
    return { newDna, layerImages: constructLayerToDna(newDna, layers) };
  } else {
    failedCount++;
    createItem(layers);
    if (failedCount >= uniqueDnaTorrance) {
      console.log(
        chalk.redBright(
          `You need more layers or elements to create a new, unique item`
        )
      );
      // @ts-expect-error TS(2580): Cannot find name 'process'. Do you need to install... Remove this comment to see the full error message
      process.exit();
    }
  }
};

const outputFiles = (_id: any, layerData: any, options: any) => {
  const { newDna, abstractedIndexes } = layerData;

  // Save the image
  fs.writeFileSync(
    `${imageDir}/${_id}${outputJPEG ? ".jpg" : ".png"}`,
    canvas.toBuffer(`${outputJPEG ? "image/jpeg" : "image/png"}`)
  );

  const { _imageHash, _prefix, _offset } = postProcessMetadata(layerData);

  const metadata = addMetadata(newDna, abstractedIndexes[0], {
    _prefix,
    _offset,
    _imageHash,
  });

  options.debug ? console.log({ metadata }) : null;
  // save the metadata json
  fs.writeFileSync(`${jsonDir}/${_id}.json`, JSON.stringify(metadata, null, 2));
  console.log(chalk.bgGreenBright.black(`Recreated item: ${_id}`));
  //TODO: update and output _metadata.json

  const originalMetadata = JSON.parse(fs.readFileSync(metadataFilePath));
  const updatedMetadata = [...originalMetadata];
  const editionIndex = _id - startIndex;
  updatedMetadata[editionIndex] = metadata;
  fs.writeFileSync(metadataFilePath, JSON.stringify(updatedMetadata, null, 2));
};

const regenerateItem = (_id: any, options: any) => {
  // get the dna lists
  // FIgure out which layer config set it's from
  // @ts-expect-error TS(2769): No overload matches this call.
  const layerEdition = layerConfigurations.reduce((acc, config) => {
    return [...acc, config.growEditionSizeTo];
  }, []);
  // @ts-expect-error TS(2339): Property 'findIndex' does not exist on type '{ gro... Remove this comment to see the full error message
  const layerConfigIndex = layerEdition.findIndex(
    (editionCount: any) => _id <= editionCount
  );

  const layers = layersSetup(layerConfigurations[layerConfigIndex].layersOrder);

  // @ts-expect-error TS(2339): Property 'newDna' does not exist on type '{ newDna... Remove this comment to see the full error message
  const { newDna, layerImages } = createItem(layers);
  options.debug ? console.log({ newDna }) : null;

  // regenerate an image using main functions
  const allImages = layerImages.reduce((images: any, layer: any) => {
    return [...images, ...layer.selectedElements];
  }, []);

  const loadedElements = allImages.reduce((acc: any, layer: any) => {
    return [...acc, loadLayerImg(layer)];
  }, []);

  Promise.all(loadedElements).then((renderObjectArray) => {
    const layerData = {
      newDna,
      layerConfigIndex,
      abstractedIndexes: [_id],
      _background: background,
    };
    // paint layers to global canvas context.. no return value
    paintLayers(ctxMain, renderObjectArray, layerData);
    // @ts-expect-error TS(2554): Expected 4 arguments, but got 3.
    outputFiles(_id, layerData, options);

    // update the _dna.json
    const existingDna = getDNA();
    const existingDnaFlat = existingDna.map((dna: any) => dna.join(DNA_DELIMITER));

    const updatedDnaList = [...existingDnaFlat];
    // find the correct entry and update it
    const dnaIndex = _id - startIndex;
    updatedDnaList[dnaIndex] = newDna;

    options.debug
      ? console.log(
          chalk.redBright(`replacing old DNA:\n`, existingDnaFlat[dnaIndex])
        )
      : null;
    options.debug
      ? console.log(
          chalk.greenBright(`\nWith new DNA:\n`, updatedDnaList[dnaIndex])
        )
      : null;

    fs.writeFileSync(
      path.join(dnaFilePath),
      JSON.stringify(updatedDnaList, null, 2)
    );
  });
};

program
  .argument("<id>")
  .option("-d, --debug", "display some debugging")
  .action((id: any, options: any, command: any) => {
    options.debug
      ? console.log(chalk.greenBright.inverse(`Regemerating #${id}`))
      : null;

    regenerateItem(id, options);
  });

program.parse();
