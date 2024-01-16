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
const outputJPEG = false;
const startIndex = 0;

const format = {
  width: 1024,
  height: 1024,
  smoothing: true,
};

const background = {
  generate: true,
  brightness: "80%",
};

const layerConfigurations = [
  {
    growEditionSizeTo: 50,
    namePrefix: "Legendary",
    layersOrder: [
      { name: "Backgrounds/Legendary", trait: "Background" },
      { name: "Bodies/Legendary", trait: "Body" },
      { name: "Bottoms/Legendary", trait: "Bottom" },
      { name: "Belts/Legendary", trait: "Belt" },
      { name: "Bracelets/Legendary", trait: "Bracelets" },
      { name: "Tops/Legendary", trait: "Top" },
      { name: "Necklaces/Legendary", trait: "Necklace" },
      { name: "Mouths/Legendary", trait: "Mouth" },
      { name: "Noses/Legendary", trait: "Nose" },
      { name: "Eyes", trait: "Eyes" },
      { name: "Hats/Legendary", trait: "Hats" },
    ],
  },
  {
    growEditionSizeTo: 200,
    namePrefix: "Rare",
    layersOrder: [
      { name: "Backgrounds/Rare", trait: "Background" },
      { name: "Bodies/Rare", trait: "Body" },
      { name: "Bottoms/Rare", trait: "Bottom" },
      { name: "Belts/Rare", trait: "Belt" },
      { name: "Bracelets/Rare", trait: "Bracelets" },
      { name: "Tops/Rare", trait: "Top" },
      { name: "Necklaces/Rare", trait: "Necklace" },
      { name: "Mouths/Common", trait: "Mouth" },
      { name: "Noses/Common", trait: "Nose" },
      { name: "Eyes", trait: "Eyes" },
      { name: "Hats/Rare", trait: "Hats" },
    ],
  },
  {
    growEditionSizeTo: 500,
    namePrefix: "Common",
    layersOrder: [
      { name: "Backgrounds/Common", trait: "Background" },
      { name: "Bodies/Common", trait: "Body" },
      { name: "Bottoms/Common", trait: "Bottom" },
      { name: "Belts/Common", trait: "Belt" },
      { name: "Bracelets/Common", trait: "Bracelets" },
      { name: "Tops/Common", trait: "Top" },
      { name: "Necklaces/Common", trait: "Necklace" },
      { name: "Mouths/Common", trait: "Mouth" },
      { name: "Noses/Common", trait: "Nose" },
      { name: "Eyes", trait: "Eyes" },
      { name: "Hats/Common", trait: "Hats" },
    ],
  },
];

const shuffleLayerConfigurations = false;
const debugLogs = true;
const emptyLayerName = "NONE";

const necklacesNames = [
  "Earth Pendant",
  "Green Recycling",
  "Yellow Recycling",
  "Blue Fantasy",
  "Cyberpunk Mechanical",
  "Golden Shells",
  "Golden Unique",
  "Colorful",
  "Pearls",
  "Yellow Pendant",
];

const bottomsName = [
  "Brown Long",
  "Green Long",
  "Red Long",
  "Black Short",
  "Brown Patterns",
  "Purple Psychedelic",
  "Blue Patterns",
  "Green Psychedelic",
  "Purple Short",
  "Blue Short",
  "Magenta Patterns",
  "Yellow Psychedelic",
  "Blue Medium",
  "Orange Skirt",
  "White Medium",
  "Blue Skirt",
  "Purple Skirt",
  "Yellow Medium",
];

const beltsNames = [
  "Black Classic",
  "Blue Classic",
  "Brown Classic",
  "Purple Classic",
  "Red Classic",
  "Black Coconut Buckle",
  "Blue Coconut Buckle",
  "Brown Bag Belt",
  "Yellow Bag Belt",
  "Black Ring",
  "Blue Ring",
  "Blue Tribal Buckle",
  "Purple Tribal Buckle",
  "Red Ring",
  "Yellow Tribal Buckle",
];

const incompatible = {
  "White Leather Bag": necklacesNames,
  "Green Leather Bag": necklacesNames,
  "Black Logo Community": necklacesNames,
  "Green Dress": bottomsName,
  "Green Dress": beltsNames,
  "Yellow Pendant": [
    "Yellow Logo Shirt",
    "Blue Logo Shirt",
    "Purple Logo Shirt",
  ],
  "Green and Patterns": ["Green Patterns"],
  "Pink and Patterns": ["Pink Patterns"],
  Green: ["Turquoise"],
  Orange: ["Orange Red"],
  Pink: ["Pink"],
  Purple: ["Purple"],
  Yellow: ["Yellow"],
};

const forcedCombinations = [];

const traitValueOverrides = {
  Helmet: "Space Helmet",
  "gold chain": "GOLDEN NECKLACE",
};

const extraMetadata = {};

const extraAttributes = () => [];

const hashImages = true;
const rarityDelimiter = "#";
const uniqueDnaTorrance = 10000;
const useRootTraitType = true;

const preview = {
  thumbPerRow: 5,
  thumbWidth: 50,
  imageRatio: format.width / format.height,
  imageName: "preview.png",
};

const preview_gif = {
  numberOfImages: 5,
  order: "ASC",
  repeat: 0,
  quality: 100,
  delay: 500,
  imageName: "preview.gif",
};

module.exports = {
  background,
  baseUri,
  buildDir,
  debugLogs,
  description,
  emptyLayerName,
  extraAttributes,
  extraMetadata,
  forcedCombinations,
  format,
  hashImages,
  incompatible,
  layerConfigurations,
  layersDir,
  outputJPEG,
  preview,
  preview_gif,
  rarityDelimiter,
  shuffleLayerConfigurations,
  startIndex,
  traitValueOverrides,
  uniqueDnaTorrance,
  useRootTraitType,
};
