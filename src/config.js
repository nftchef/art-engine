"use strict";

const path = require("path");
const isLocal = typeof process.pkg === "undefined";
const basePath = isLocal ? process.cwd() : path.dirname(process.execPath);
const { MODE } = require(path.join(basePath, "src/blendMode.js"));

const buildDir = path.join(basePath, "/build");
const layersDir = path.join(basePath, "/layers");

const description =
  "This is the description of your NFT project, remember to replace this";
const baseUri = "ipfs://NewUriToReplace";

const baseExternalUrl = "https://test.com/collection?asset="; //Base url for extelnal link under the image on OpenSea. The edition number will be appended. Leave empty "" to remove. - BB

const outputJPEG = false; // if false, the generator outputs png's

// if you use an empty/transparent file, set the name here.
const emptyLayerName = "NONE";

//IF you need a provenance hash, turn this on 
const hashImages = true;

const layerConfigurations = [

  {
    growEditionSizeTo: 5,
    namePrefix: "Monkey",
    resetNameIndex: true, // this will start the count at #1 for this layerconfig
    nameSuffix: "Set A", // add a suffix after the number. if resetNameIndex is on too, put the reseted counter after the suffix - BB
    descriptionOverwrite: "{name} with Unique Description For Layer Set A", // LayerConfig spesific descriptions. Use {name} to embed asset names.
    layersOrder: [
      {
        name: "Back Accessory",
        options: {
          bypassDNA: true,
        },
      },
      { name: "Head" },
      { name: "Clothes" },
      { name: "Eyes" },
      { name: "Hair" },
      { name: "Head Accessory" },
      { name: "Shirt Accessories" },
    ],
  },
  
  {
    growEditionSizeTo: 10,
    namePrefix: "Monkey",
    resetNameIndex: false, // this will start the count at #1 for this layerconfig
    nameSuffix: "Set B", // add a suffix after the number. if resetNameIndex is on too, put the reseted counter after the suffix - BB
    descriptionOverwrite: "Description for {name} from Layer Set B", // LayerConfig spesific descriptions. Use {name} to embed asset names.
    
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
  // floral: ["MetallicShades", "Golden Sakura"],
};

const shuffleLayerConfigurations = false;

/**
 * In the event that a filename cannot be the trait value name, for example when
 * multiple items should have the same value, specify
 * clean-filename: trait-value override pairs. Wrap filenames with spaces in quotes.
 */
const traitValueOverrides = {
  Helmet: "Space Helmet",
  "gold chain": "GOLDEN NECKLACE",
};

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

const rarityDelimiter = "#";

const uniqueDnaTorrance = 10000;

/**
 * Set to true to always use the root folder as trait_tybe
 * Set to false to use weighted parent folders as trait_type
 * Default is true.
 */
const useRootTraitType = true;

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
  traitValueOverrides,
  outputJPEG,
  emptyLayerName,
  useRootTraitType,
  hashImages,
};
