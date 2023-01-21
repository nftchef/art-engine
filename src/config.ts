"use strict";

import path from "path";
// const isLocal = typeof process.pkg === "undefined";
// const basePath = isLocal ? process.cwd() : path.dirname(process.execPath);
const basePath = process.cwd();
// see src/blendMode.js for available blend modes
// documentation: https://developer.mozilla.org/en-US/docs/Web/API/CanvasRenderingContext2D/globalCompositeOperation
import { MODE } from "./blendMode";

export const buildDir = path.join(basePath, "/build");
export const layersDir = path.join(basePath, "/layers");

/*********************
 * General Generator Options
 ***********************/

export const description =
  "This is the description of your NFT project, remember to replace this";
export const baseUri = "ipfs://NewUriToReplace";

export const outputJPEG = false; // if false, the generator outputs png's

/**
 * Set your tokenID index start number.
 * ⚠️ Be sure it matches your smart contract!
 */
export const startIndex = 0;

export const format = {
  width: 512,
  height: 512,
  smoothing: true, // set to false when up-scaling pixel art.
};

export const background = {
  generate: true,
  brightness: "80%",
};

export const layerConfigurations = [
  {
    growEditionSizeTo: 10,
    namePrefix: "Series 2", // Use to add a name to Metadata `name:`
    layersOrder: [
      { name: "Background" },
      {
        name: "Back Accessory",
        // options: {
        //   bypassDNA: true,
        // },
      },
      { name: "Head" },
      { name: "Clothes" },
      { name: "Eyes" },
      { name: "Hair" },
      { name: "Accessory" },
      { name: "Shirt Accessories" },
    ],
  },
  // {
  //   growEditionSizeTo: 10,
  //   namePrefix: "Lion",
  //   resetNameIndex: true, // this will start the Lion count at #1 instead of #6
  //   layersOrder: [
  //     { name: "Background" },
  //     { name: "Hats" },
  //     { name: "Male Hair" },
  //   ],
  // },
];

/**
 * Set to true for when using multiple layersOrder configuration
 * and you would like to shuffle all the artwork together
 */
export const shuffleLayerConfigurations = false;

export const debugLogs = true;

/*********************
 * Advanced Generator Options
 ***********************/

// if you use an empty/transparent file, set the name here.
export const emptyLayerName = "NONE";

/**
 * Incompatible items can be added to this object by a files cleanName
 * This works in layer order, meaning, you need to define the layer that comes
 * first as the Key, and the incompatible items that _may_ come after.
 * The current version requires all layers to have unique names, or you may
 * accidentally set incompatibilities for the _wrong_ item.
 */
export const incompatible = {
  //   Red: ["Dark Long"],
  //   // directory incompatible with directory example
  //   White: ["rare-Pink-Pompadour"],
};

/**
 * Require combinations of files when constructing DNA, this bypasses the
 * randomization and weights.
 *
 * The layer order matters here, the key (left side) is an item within
 * the layer that comes first in the stack.
 * the items in the array are "required" items that should be pulled from folders
 * further in the stack
 */
export const forcedCombinations = {
  // floral: ["MetallicShades", "Golden Sakura"],
};

export interface traitValueOverrides {
  [key: string]: string
};

/**
 * In the event that a filename cannot be the trait value name, for example when
 * multiple items should have the same value, specify
 * clean-filename: trait-value override pairs. Wrap filenames with spaces in quotes.
 */
export const  traitValueOverrides: traitValueOverrides = {
  Helmet: "Space Helmet",
  "gold chain": "GOLDEN NECKLACE",
};

export const extraMetadata = {};

export type LayerAttribute = {
  trait_type: string,
  value: any,
  display_type?: string,
};


export const extraAttributes = () => [
  // Optionally, if you need to overwrite one of your layers attributes.
  // You can include the same name as the layer, here, and it will overwrite
  //
  // {
  // trait_type: "Bottom lid",
  //   value: ` Bottom lid # ${Math.random() * 100}`,
  // },
  // {
  //   display_type: "boost_number",
  //   trait_type: "Aqua Power",
  //   value: Math.random() * 100,
  // },
  // {
  //   display_type: "boost_number",
  //   trait_type: "Health",
  //   value: Math.random() * 100,
  // },
  // {
  //   display_type: "boost_number",
  //   trait_type: "Mana",
  //   value: Math.floor(Math.random() * 100),
  // },
];

// Outputs an Keccack256 hash for the image. Required for provenance hash
export const hashImages = true;

export const rarityDelimiter = "#";

export const uniqueDnaTorrance = 10000;

/**
 * Set to true to always use the root folder as trait_type
 * Set to false to use weighted parent folders as trait_type
 * Default is true.
 */
export const useRootTraitType = true;

export const preview = {
  thumbPerRow: 5,
  thumbWidth: 50,
  imageRatio: format.width / format.height,
  imageName: "preview.png",
};

export const preview_gif = {
  numberOfImages: 5,
  order: "ASC", // ASC, DESC, MIXED
  repeat: 0,
  quality: 100,
  delay: 500,
  imageName: "preview.gif",
};
