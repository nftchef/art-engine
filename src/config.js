"use strict";

const path = require("path");
const isLocal = typeof process.pkg === "undefined";
const basePath = isLocal ? process.cwd() : path.dirname(process.execPath);
const { MODE } = require(path.join(basePath, "src/blendMode.js"));

const buildDir = path.join(basePath, "/build");
const layersDir = path.join(basePath, "/layers");

const description =
  "Default Description";
const baseUri = "ipfs://NewUriToReplace";

const baseExternalUrl = "https://test.com/collection?asset="; //Base url for extelnal link under the image on OpenSea. The edition number will be appended. Leave empty "" to remove. - BB

const outputJPEG = false; // if false, the generator outputs png's

// if you use an empty/transparent file, set the name here.
const emptyLayerName = "NONE";

//IF you need a provenance hash, turn this on 
const hashImages = true;

const layerConfigurations = [

  {
    growEditionSizeTo: 10,
    descriptionOverwrite: " with Unique Description For Layer Set A", // for layerSet spesific descriptions. Here, it is written in a way to suit the names that will be prepended.
    prependNameInDescription: true, // add/prepend asset name to the description. - BB
    namePrefix: "Monkey",
    resetNameIndex: true, // this will start the count at #1 for this layerconfig
    nameSuffix: "Set A", // add a suffix after the number. if resetNameIndex is on too, put the reseted counter after the suffix - BB
    layersOrder: [
      { name: "Back Accessory" },
      { name: "Head" },
      { name: "Clothes" },
      { name: "Eyes" },
      { name: "Hair" },
      { name: "Head Accessory" },
      { name: "Shirt Accessories" },
    ],
  },
  
  {
    growEditionSizeTo: 20,
    descriptionOverwrite: " with Unique Description For Layer Set A", // for layerSet spesific descriptions. Here, it is written in a way to suit the names that will be prepended.
    prependNameInDescription: true, // add/prepend asset name to the description. - BB
    namePrefix: "Monkey",
    resetNameIndex: true, // this will start the count at #1 for this layerconfig
    nameSuffix: "Set B", // add a suffix after the number. if resetNameIndex is on too, put the reseted counter after the suffix - BB
    layersOrder: [
      { name: "Back Accessory" },
      { name: "Head" },
      { name: "Clothes" },
      { name: "Eyes" },
      { name: "Hair" },
      { name: "Head Accessory" },
      { name: "Shirt Accessories" },
    ],
  },
];


/** 
 * Incompatible items can be added to this object by a files cleanName
 * This works in layer order, meaning, you need to define the layer that comes
 * first as the Key, and the incompatible items that _may_ come after.
 * The current version requires all layers to have unique names, or you may
 * accidentally set incompatibilities for the _wrong_ item.
 */
const incompatible = {
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

const forcedCombinations = {
  //    Force some layers if a certain layer is used.
  //floral: ["MetallicShades", "Golden Sakura"],
};

const shuffleLayerConfigurations = false;

const debugLogs = true;

const format = {
  width: 512,
  height: 512,
};

const background = {
  generate: true,
  brightness: "80%",
};

const extraMetadata = {
  // You can add extra info for your collection here. Such as the artist name.
  "Artist": "A person",
};

const extraAttributes = () => [

  //OpenSea Trait Types for rich data = https://docs.opensea.io/docs/metadata-standards
  //These are just examples to show dynamic uses. Delete all these if they do not fiy in your project. 
  {
    display_type: "boost_percentage", // Boost trait with lightning icon. Number is shown with a % sign. Circle fill by the percentage.
    trait_type: "Health",
    value: Math.floor(Math.random() * 100),
  },
  {
    display_type: "boost_number", // Boost trait with lightning icon. Number is shown with a + sign. Circle is filled.
    trait_type: "Energy",
    value: Math.floor(Math.random() * 100),
  },
  {
    display_type: "number", // Appears in the "Stats" area with a large number. "Out of X" value is taken from the collection.
    trait_type: "Mana",
    value: Math.floor(Math.random() * 100),
  },
  {
    //Integer value with no display_type set makes the trait appear in the "Rankings" area with a progress bar. Max value is taken from the collection.
    trait_type: "Rank", 
    value: Math.floor(Math.random() * 100),
  },

  {
    //display_type date makes a date section appear in the right column near "Rankings" and "Stats."
    display_type: "date", 
    trait_type: "Birthday", 

    // Give a random date between;
	  // Unix Timestamp 1609455600 (GMT Thu Dec 31 2020 23:00:00 GMT+0000) and
	  // Unix Timestamp 631148400 (GMT Sun Dec 31 1989 23:00:00 GMT+0000)
	  value: (Math.floor( Math.random() * (1609455634 - 631148434) ) + 631148434)
  },

  {
    //String value with no display_type set makes the trait appear in the "Properties" area like layers.
    trait_type: "Familly",
    value: `Familly #${ Math.floor(Math.random() * (6 - 1 + 1) ) + 1 }`, // Math.floor(Math.random() * (max - min + 1) ) + min; // min max included
  }

  // Optionally, if you need to overwrite one of your layers attributes.
  // You can include the same name as the layer, here, and it will overwrite

];

const rarityDelimiter = "#";

const uniqueDnaTorrance = 10000;

const preview = {
  thumbPerRow: 5,
  thumbWidth: 50,
  imageRatio: format.width / format.height,
  imageName: "preview.png",
};

module.exports = {
  buildDir,
  layersDir,
  format,
  baseUri,
  baseExternalUrl,
  description,
  background,
  uniqueDnaTorrance,
  layerConfigurations,
  rarityDelimiter,
  preview,
  shuffleLayerConfigurations,
  debugLogs,
  extraAttributes,
  extraMetadata,
  incompatible,
  forcedCombinations,
  outputJPEG,
  emptyLayerName,
  hashImages,
};
