"use strict";

import path from "path";
import fs from "fs";
import keccak256 from "keccak256";
import chalk from "chalk";
import { createCanvas, loadImage } from "canvas";

import {
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
  rarityDelimiter,
  shuffleLayerConfigurations,
  startIndex,
  traitValueOverrides,
  uniqueDnaTorrance,
  useRootTraitType,
  LayerAttribute
} from "./config";
const canvas = createCanvas(format.width, format.height);
const ctxMain = canvas.getContext("2d");
ctxMain.imageSmoothingEnabled = format.smoothing;

let metadataList: Array<object> = [];
let attributesList: Array<LayerAttribute> = [];

// when generating a random background used to add to DNA
let generatedBackground: string;

let dnaList = new Set(); // internal+external: list of all files. used for regeneration etc
let uniqueDNAList = new Set(); // internal: post-filtered dna set for bypassDNA etc.
const DNA_DELIMITER = "*";

const zflag = /(z-?\d*,)/;

export const buildSetup = () => {
  if (fs.existsSync(buildDir)) {
    fs.rmdirSync(buildDir, { recursive: true });
  }
  fs.mkdirSync(buildDir);
  fs.mkdirSync(path.join(buildDir, "/json"));
  fs.mkdirSync(path.join(buildDir, "/images"));
};

const getRarityWeight = (_path: any) => {
  // check if there is an extension, if not, consider it a directory
  const exp = new RegExp(`${rarityDelimiter}(\\d*)`, "g");
  const weight = exp.exec(_path);
  const weightNumber = weight ? Number(weight[1]) : -1;

  if (weightNumber < 0 || isNaN(weightNumber)) {
    return "required";
  }
  return weightNumber;
};

const cleanDna = (_str: any) => {
  var dna = _str.split(":").shift();
  return dna;
};

const cleanName = (_str: any) => {
  const hasZ = zflag.test(_str);

  const zRemoved = _str.replace(zflag, "");

  const extension = /\.[0-9a-zA-Z]+$/;
  const hasExtension = extension.test(zRemoved);
  let nameWithoutExtension = hasExtension ? zRemoved.slice(0, -4) : zRemoved;
  var nameWithoutWeight = nameWithoutExtension.split(rarityDelimiter).shift();
  return nameWithoutWeight;
};

const parseQueryString = (filename: any, layer: any, sublayer: any) => {
  const query = /\?(.*)\./;
  const querystring = query.exec(filename);
  if (!querystring) {
    return getElementOptions(layer, sublayer);
  }

  const layerstyles = querystring[1].split("&").reduce((r, setting) => {
    const keyPairs = setting.split("=");
    return { ...r, [keyPairs[0]]: keyPairs[1] };
  }, []);

  return {
    // @ts-expect-error TS(2339): Property 'blend' does not exist on type 'never[]'.
    blendmode: layerstyles.blend
      // @ts-expect-error TS(2339): Property 'blend' does not exist on type 'never[]'.
      ? layerstyles.blend
      : getElementOptions(layer, sublayer).blendmode,
    // @ts-expect-error TS(2339): Property 'opacity' does not exist on type 'never[]... Remove this comment to see the full error message
    opacity: layerstyles.opacity
      // @ts-expect-error TS(2339): Property 'opacity' does not exist on type 'never[]... Remove this comment to see the full error message
      ? layerstyles.opacity / 100
      : getElementOptions(layer, sublayer).opacity,
  };
};

/**
 * Given some input, creates a sha256 hash.
 * @param {Object} input
 */
const hash = (input: any) => {
  const hashable = typeof input === "string" ? JSON.stringify(input) : input;
  return keccak256(hashable).toString("hex");
};

/**
 * Get't the layer options from the parent, or grandparent layer if
 * defined, otherwise, sets default options.
 *
 * @param {Object} layer the parent layer object
 * @param {String} sublayer Clean name of the current layer
 * @returns {blendmode, opacity} options object
 */
const getElementOptions = (layer: any, sublayer: any) => {
  let blendmode = "source-over";
  let opacity = 1;
  if (layer.sublayerOptions?.[sublayer]) {
    const options = layer.sublayerOptions[sublayer];

    // @ts-expect-error TS(2304): Cannot find name 'bypassDNA'.
    options.bypassDNA !== undefined ? (bypassDNA = options.bypassDNA) : null;
    options.blend !== undefined ? (blendmode = options.blend) : null;
    options.opacity !== undefined ? (opacity = options.opacity) : null;
  } else {
    // inherit parent blend mode
    blendmode = layer.blend != undefined ? layer.blend : "source-over";
    opacity = layer.opacity != undefined ? layer.opacity : 1;
  }
  return { blendmode, opacity };
};

const parseZIndex = (str: any) => {
  const z = zflag.exec(str);
  // @ts-expect-error TS(2531): Object is possibly 'null'.
  return z ? parseInt(z[0].match(/-?\d+/)[0]) : null;
};

const getElements = (path: any, layer: any) => {
  return fs
    .readdirSync(path)
    .filter((item: any) => {
      const invalid = /(\.ini)/g;
      return !/(^|\/)\.[^\/\.]/g.test(item) && !invalid.test(item);
    })
    .map((i: any, index: any) => {
      const name = cleanName(i);
      const extension = /\.[0-9a-zA-Z]+$/;
      const sublayer = !extension.test(i);
      const weight = getRarityWeight(i);

      const { blendmode, opacity } = parseQueryString(i, layer, name);
      //pass along the zflag to any children
      const zindex = zflag.exec(i)
        // @ts-expect-error TS(2531): Object is possibly 'null'.
        ? zflag.exec(i)[0]
        : layer.zindex
        ? layer.zindex
        : "";

      const element = {
        sublayer,
        weight,
        blendmode,
        opacity,
        id: index,
        name,
        filename: i,
        path: `${path}${i}`,
        zindex,
      };

      if (sublayer) {
        element.path = `${path}${i}`;
        const subPath = `${path}${i}/`;
        const sublayer = { ...layer, blend: blendmode, opacity, zindex };
        // @ts-expect-error TS(2339): Property 'elements' does not exist on type '{ subl... Remove this comment to see the full error message
        element.elements = getElements(subPath, sublayer);
      }

      // Set trait type on layers for metadata
      const lineage = path.split("/");
      let typeAncestor;

      if (weight !== "required") {
        typeAncestor = element.sublayer ? 3 : 2;
      }
      if (weight === "required") {
        typeAncestor = element.sublayer ? 1 : 3;
      }
      // we need to check if the parent is required, or if it's a prop-folder
      if (
        useRootTraitType &&
        // @ts-expect-error TS(2532): Object is possibly 'undefined'.
        lineage[lineage.length - typeAncestor].includes(rarityDelimiter)
      ) {
        // @ts-expect-error TS(2532): Object is possibly 'undefined'.
        typeAncestor += 1;
      }

      // @ts-expect-error TS(2532): Object is possibly 'undefined'.
      const parentName = cleanName(lineage[lineage.length - typeAncestor]);

      // @ts-expect-error TS(2339): Property 'trait' does not exist on type '{ sublaye... Remove this comment to see the full error message
      element.trait = layer.sublayerOptions?.[parentName]
        ? layer.sublayerOptions[parentName].trait
        : layer.trait !== undefined
        ? layer.trait
        : parentName;

      const rawTrait = getTraitValueFromPath(element, lineage);
      const trait = processTraitOverrides(rawTrait);
      // @ts-expect-error TS(2339): Property 'traitValue' does not exist on type '{ su... Remove this comment to see the full error message
      element.traitValue = trait;

      return element;
    });
};

const getTraitValueFromPath = (element: any, lineage: any) => {
  // If the element is a required png. then, the trait property = the parent path
  // if the element is a non-required png. black%50.png, then element.name is the value and the parent Dir is the prop
  if (element.weight !== "required") {
    return element.name;
  } else if (element.weight === "required") {
    // if the element is a png that is required, get the traitValue from the parent Dir
    return element.sublayer ? true : cleanName(lineage[lineage.length - 2]);
  }
};

/**
 * Checks the override object for trait overrides
 * @param {String} trait The default trait value from the path-name
 * @returns String trait of either overridden value of raw default.
 */
const processTraitOverrides = (trait: string) => {
  return traitValueOverrides[trait] ? traitValueOverrides[trait] : trait;
};

const layersSetup = (layersOrder: any) => {
  const layers = layersOrder.map((layerObj: any, index: any) => {
    return {
      id: index,
      name: layerObj.name,
      blendmode:
        layerObj["blend"] != undefined ? layerObj["blend"] : "source-over",
      opacity: layerObj["opacity"] != undefined ? layerObj["opacity"] : 1,
      elements: getElements(`${layersDir}/${layerObj.name}/`, layerObj),
      ...(layerObj.display_type !== undefined && {
        display_type: layerObj.display_type,
      }),
      bypassDNA:
        layerObj.options?.["bypassDNA"] !== undefined
          ? layerObj.options?.["bypassDNA"]
          : false,
    };
  });

  return layers;
};

const saveImage = (_editionCount: any, _buildDir: any, _canvas: any) => {
  fs.writeFileSync(
    `${_buildDir}/images/${_editionCount}${outputJPEG ? ".jpg" : ".png"}`,
    _canvas.toBuffer(`${outputJPEG ? "image/jpeg" : "image/png"}`)
  );
};

const genColor = () => {
  let hue = Math.floor(Math.random() * 360);
  let pastel = `hsl(${hue}, 100%, ${background.brightness})`;
  // store the background color in the dna
  generatedBackground = pastel; //TODO: storing in a global var is brittle. could be improved.
  return pastel;
};

const drawBackground = (canvasContext: any, background: any) => {
  canvasContext.fillStyle = background.HSL ?? genColor();

  canvasContext.fillRect(0, 0, format.width, format.height);
};

const addMetadata = (_dna: any, _edition: any, _prefixData: any) => {
  let dateTime = Date.now();
  const { _prefix, _offset, _imageHash } = _prefixData;

  const combinedAttrs = [...attributesList, ...extraAttributes()];
  const cleanedAttrs = combinedAttrs.reduce((acc: Array<LayerAttribute>, current: LayerAttribute) => {
    const x = acc.find((item: LayerAttribute) => item.trait_type === current.trait_type);
    if (!x) {
      return acc.concat([current]);
    } else {
      return acc;
    }
  }, []);

  let tempMetadata = {
    name: `${_prefix ? _prefix + " " : ""}#${_edition - _offset}`,
    description: description,
    image: `${baseUri}/${_edition}${outputJPEG ? ".jpg" : ".png"}`,
    ...(hashImages === true && { imageHash: _imageHash }),
    edition: _edition,
    date: dateTime,
    ...extraMetadata,
    attributes: cleanedAttrs,
    compiler: "HashLips Art Engine - NFTChef fork",
  };
  metadataList.push(tempMetadata);
  attributesList = [];
  return tempMetadata;
};

const addAttributes = (_element: any) => {
  let selectedElement = _element.layer;
  const layerAttributes: LayerAttribute  = {
    trait_type: _element.layer.trait,
    value: selectedElement.traitValue,
    ...(_element.layer.display_type !== undefined && {
      display_type: _element.layer.display_type,
    }),
  };
  if (
    attributesList.some(
      (attr: any) => attr.trait_type === layerAttributes.trait_type
    )
  )
    return;
  attributesList.push(layerAttributes);
};

const loadLayerImg = async (_layer: any) => {
  return new Promise(async (resolve) => {
    // selected elements is an array.
    const image = await loadImage(`${_layer.path}`).catch((err: any) => console.log(chalk.redBright(`failed to load ${_layer.path}`, err))
    );
    resolve({ layer: _layer, loadedImage: image });
  });
};

const drawElement = (_renderObject: any) => {
  const layerCanvas = createCanvas(format.width, format.height);
  const layerctx = layerCanvas.getContext("2d");
  layerctx.imageSmoothingEnabled = format.smoothing;

  layerctx.drawImage(
    _renderObject.loadedImage,
    0,
    0,
    format.width,
    format.height
  );

  addAttributes(_renderObject);
  return layerCanvas;
};

const constructLayerToDna = (_dna = [], _layers = []) => {
  // @ts-expect-error TS(2339): Property 'split' does not exist on type 'never[]'.
  const dna = _dna.split(DNA_DELIMITER);
  let mappedDnaToLayers = _layers.map((layer, index) => {
    let selectedElements: any = [];
    const layerImages = dna.filter(
      // @ts-expect-error TS(2339): Property 'id' does not exist on type 'never'.
      (element: any) => element.split(".")[0] == layer.id
    );
    layerImages.forEach((img: any) => {
      const indexAddress = cleanDna(img);

      //

      const indices = indexAddress.toString().split(".");
      // const firstAddress = indices.shift();
      const lastAddress = indices.pop(); // 1
      // recursively go through each index to get the nested item
      let parentElement = indices.reduce((r: any, nestedIndex: any) => {
        if (!r[nestedIndex]) {
          throw new Error("wtf");
        }
        return r[nestedIndex].elements;
      }, _layers); //returns string, need to return

      selectedElements.push(parentElement[lastAddress]);
    });
    // If there is more than one item whose root address indicies match the layer ID,
    // continue to loop through them an return an array of selectedElements

    return {
      // @ts-expect-error TS(2339): Property 'name' does not exist on type 'never'.
      name: layer.name,
      // @ts-expect-error TS(2339): Property 'blendmode' does not exist on type 'never... Remove this comment to see the full error message
      blendmode: layer.blendmode,
      // @ts-expect-error TS(2339): Property 'opacity' does not exist on type 'never'.
      opacity: layer.opacity,
      selectedElements: selectedElements,
      // @ts-expect-error TS(2339): Property 'display_type' does not exist on type 'ne... Remove this comment to see the full error message
      ...(layer.display_type !== undefined && {
        // @ts-expect-error TS(2339): Property 'display_type' does not exist on type 'ne... Remove this comment to see the full error message
        display_type: layer.display_type,
      }),
    };
  });
  return mappedDnaToLayers;
};

/**
 * In some cases a DNA string may contain optional query parameters for options
 * such as bypassing the DNA isUnique check, this function filters out those
 * items without modifying the stored DNA.
 *
 * @param {String} _dna New DNA string
 * @returns new DNA string with any items that should be filtered, removed.
 */
const filterDNAOptions = (_dna: any) => {
  const filteredDNA = _dna.split(DNA_DELIMITER).filter((element: any) => {
    const query = /(\?.*$)/;
    const querystring = query.exec(element);
    if (!querystring) {
      return true;
    }
    // convert the items in the query string to an object
    const options = querystring[1].split("&").reduce((r, setting) => {
      const keyPairs = setting.split("=");
      //   construct the object →       {bypassDNA: bool}
      return { ...r, [keyPairs[0].replace("?", "")]: keyPairs[1] };
    }, []);
    // currently, there is only support for the bypassDNA option,
    // when bypassDNA is true, return false to omit from .filter
    // @ts-expect-error TS(2339): Property 'bypassDNA' does not exist on type 'never... Remove this comment to see the full error message
    return options.bypassDNA === "true" ? false : true;
  });

  return filteredDNA.join(DNA_DELIMITER);
};

/**
 * Cleaning function for DNA strings. When DNA strings include an option, it
 * is added to the filename with a ?setting=value query string. It needs to be
 * removed to properly access the file name before Drawing.
 *
 * @param {String} _dna The entire newDNA string
 * @returns Cleaned DNA string without querystring parameters.
 */
const removeQueryStrings = (_dna: any) => {
  const query = /(\?.*$)/;
  return _dna.replace(query, "");
};

/**
 * determine if the sanitized/filtered DNA string is unique or not by comparing
 * it to the set of all previously generated permutations.
 *
 * @param {String} _dna string
 * @returns isUnique is true if uniqueDNAList does NOT contain a match,
 *  false if uniqueDANList.has() is true
 */
const isDnaUnique = (_dna = []) => {
  const filtered = filterDNAOptions(_dna);
  return !uniqueDNAList.has(filterDNAOptions(_dna));
};

// expecting to return an array of strings for each _layer_ that is picked,
// should be a flattened list of all things that are picked randomly AND required
/**
 *
 * @param {Object} layer The main layer, defined in config.layerConfigurations
 * @param {Array} dnaSequence Strings of layer to object mappings to nesting structure
 * @param {Number*} parentId nested parentID, used during recursive calls for sublayers
 * @param {Array*} incompatibleDNA Used to store incompatible layer names while building DNA
 * @param {Array*} forcedDNA Used to store forced layer selection combinations names while building DNA
 * @param {Int} zIndex Used in the dna string to define a layers stacking order
 *  from the top down
 * @returns Array DNA sequence
 */
// @ts-expect-error TS(7023): 'pickRandomElement' implicitly has return type 'an... Remove this comment to see the full error message
function pickRandomElement(
  layer: any,
  dnaSequence: any,
  parentId: any,
  incompatibleDNA: any,
  forcedDNA: any,
  bypassDNA: any,
  zIndex: any
) {
  let totalWeight = 0;
  // Does this layer include a forcedDNA item? ya? just return it.
  const forcedPick = layer.elements.find((element: any) => forcedDNA.includes(element.name)
  );
  if (forcedPick) {
    debugLogs
      ? console.log(chalk.yellowBright(`Force picking ${forcedPick.name}/n`))
      : null;
    if (forcedPick.sublayer) {
      return dnaSequence.concat(
        pickRandomElement(
          forcedPick,
          dnaSequence,
          `${parentId}.${forcedPick.id}`,
          incompatibleDNA,
          forcedDNA,
          bypassDNA,
          zIndex
        )
      );
    }
    let dnaString = `${parentId}.${forcedPick.id}:${forcedPick.zindex}${forcedPick.filename}${bypassDNA}`;
    return dnaSequence.push(dnaString);
  }

  if (incompatibleDNA.includes(layer.name) && layer.sublayer) {
    debugLogs
      ? console.log(
          `Skipping incompatible sublayer directory, ${layer.name}`,
          layer.name
        )
      : null;
    return dnaSequence;
  }

  const compatibleLayers = layer.elements.filter(
    (layer: any) => !incompatibleDNA.includes(layer.name)
  );
  if (compatibleLayers.length === 0) {
    debugLogs
      ? console.log(
          chalk.yellow(
            "No compatible layers in the directory, skipping",
            layer.name
          )
        )
      : null;
    return dnaSequence;
  }

  compatibleLayers.forEach((element: any) => {
    // If there is no weight, it's required, always include it
    // If directory has %, that is % chance to enter the dir
    if (element.weight == "required" && !element.sublayer) {
      let dnaString = `${parentId}.${element.id}:${element.zindex}${element.filename}${bypassDNA}`;
      dnaSequence.unshift(dnaString);
      return;
    }
    // when the current directory is a required folder
    // and the element in the loop is another folder
    if (element.weight == "required" && element.sublayer) {
      const next = pickRandomElement(
        element,
        dnaSequence,
        `${parentId}.${element.id}`,
        incompatibleDNA,
        forcedDNA,
        bypassDNA,
        zIndex
      );
    }
    if (element.weight !== "required") {
      totalWeight += element.weight;
    }
  });
  // if the entire directory should be ignored…

  // number between 0 - totalWeight
  const currentLayers = compatibleLayers.filter((l: any) => l.weight !== "required");

  let random = Math.floor(Math.random() * totalWeight);

  for (var i = 0; i < currentLayers.length; i++) {
    // subtract the current weight from the random weight until we reach a sub zero value.
    // Check if the picked image is in the incompatible list
    random -= currentLayers[i].weight;

    // e.g., directory, or, all files within a directory
    if (random < 0) {
      // Check for incompatible layer configurations and only add incompatibilities IF
      // chosing _this_ layer.
      // @ts-expect-error TS(7053): Element implicitly has an 'any' type because expre... Remove this comment to see the full error message
      if (incompatible[currentLayers[i].name]) {
        debugLogs
          ? console.log(
              `Adding the following to incompatible list`,
              // @ts-expect-error TS(7053): Element implicitly has an 'any' type because expre... Remove this comment to see the full error message
              ...incompatible[currentLayers[i].name]
            )
          : null;
        // @ts-expect-error TS(7053): Element implicitly has an 'any' type because expre... Remove this comment to see the full error message
        incompatibleDNA.push(...incompatible[currentLayers[i].name]);
      }
      // Similar to incompaticle, check for forced combos
      // @ts-expect-error TS(7053): Element implicitly has an 'any' type because expre... Remove this comment to see the full error message
      if (forcedCombinations[currentLayers[i].name]) {
        debugLogs
          ? console.log(
              chalk.bgYellowBright.black(
                `\nSetting up the folling forced combinations for ${currentLayers[i].name}: `,
                // @ts-expect-error TS(7053): Element implicitly has an 'any' type because expre... Remove this comment to see the full error message
                ...forcedCombinations[currentLayers[i].name]
              )
            )
          : null;
        // @ts-expect-error TS(7053): Element implicitly has an 'any' type because expre... Remove this comment to see the full error message
        forcedDNA.push(...forcedCombinations[currentLayers[i].name]);
      }
      // if there's a sublayer, we need to concat the sublayers parent ID to the DNA srting
      // and recursively pick nested required and random elements
      if (currentLayers[i].sublayer) {
        return dnaSequence.concat(
          pickRandomElement(
            currentLayers[i],
            dnaSequence,
            `${parentId}.${currentLayers[i].id}`,
            incompatibleDNA,
            forcedDNA,
            bypassDNA,
            zIndex
          )
        );
      }

      // none/empty layer handler
      if (currentLayers[i].name === emptyLayerName) {
        return dnaSequence;
      }
      let dnaString = `${parentId}.${currentLayers[i].id}:${currentLayers[i].zindex}${currentLayers[i].filename}${bypassDNA}`;
      return dnaSequence.push(dnaString);
    }
  }
}

/**
 * given the nesting structure is complicated and messy, the most reliable way to sort
 * is based on the number of nested indecies.
 * This sorts layers stacking the most deeply nested grandchildren above their
 * immediate ancestors
 * @param {[String]} layers array of dna string sequences
 */
const sortLayers = (layers: any) => {
  const nestedsort = layers.sort((a: any, b: any) => {
    const addressA = a.split(":")[0];
    const addressB = b.split(":")[0];
    return addressA.length - addressB.length;
  });

  let stack = { front: [], normal: [], end: [] };
  stack = nestedsort.reduce((acc: any, layer: any) => {
    const zindex = parseZIndex(layer);
    if (!zindex)
      return { ...acc, normal: [...(acc.normal ? acc.normal : []), layer] };
    // move negative z into `front`
    if (zindex < 0)
      return { ...acc, front: [...(acc.front ? acc.front : []), layer] };
    // move positive z into `end`
    if (zindex > 0)
      return { ...acc, end: [...(acc.end ? acc.end : []), layer] };
    // make sure front and end are sorted
    // contat everything back to an ordered array
  }, stack);

  // sort the normal array
  stack.normal.sort();

  return sortByZ(stack.front).concat(stack.normal).concat(sortByZ(stack.end));
};

/** File String sort by zFlag */
function sortByZ(dnastrings: any) {
  return dnastrings.sort((a: any, b: any) => {
    const indexA = parseZIndex(a);
    const indexB = parseZIndex(b);
    // @ts-expect-error TS(2531): Object is possibly 'null'.
    return indexA - indexB;
  });
}

/**
 * Sorting by index based on the layer.z property
 * @param {Array } layers selected Image layer objects array
 */
function sortZIndex(layers: any) {
  return layers.sort((a: any, b: any) => {
    const indexA = parseZIndex(a.zindex);
    const indexB = parseZIndex(b.zindex);
    // @ts-expect-error TS(2531): Object is possibly 'null'.
    return indexA - indexB;
  });
}

const createDna = (_layers: any) => {
  let dnaSequence: any = [];
  let incompatibleDNA: any = [];
  let forcedDNA: any = [];

  _layers.forEach((layer: any) => {
    const layerSequence: any = [];
    pickRandomElement(
      layer,
      layerSequence,
      layer.id,
      incompatibleDNA,
      forcedDNA,
      layer.bypassDNA ? "?bypassDNA=true" : "",
      layer.zindex ? layer.zIndex : ""
    );
    const sortedLayers = sortLayers(layerSequence);
    dnaSequence = [...dnaSequence, [sortedLayers]];
  });
  const zSortDNA = sortByZ(dnaSequence.flat(2));
  const dnaStrand = zSortDNA.join(DNA_DELIMITER);

  return dnaStrand;
};

const writeMetaData = (_data: any) => {
  fs.writeFileSync(`${buildDir}/json/_metadata.json`, _data);
};

const writeDnaLog = (_data: any) => {
  fs.writeFileSync(`${buildDir}/_dna.json`, _data);
};

const saveMetaDataSingleFile = (_editionCount: any, _buildDir: any) => {
  let metadata = metadataList.find((meta: any) => meta.edition == _editionCount);
  debugLogs
    ? console.log(
        `Writing metadata for ${_editionCount}: ${JSON.stringify(metadata)}`
      )
    : null;
  fs.writeFileSync(
    `${_buildDir}/json/${_editionCount}.json`,
    JSON.stringify(metadata, null, 2)
  );
};

function shuffle(array: any) {
  let currentIndex = array.length,
    randomIndex;
  while (currentIndex != 0) {
    randomIndex = Math.floor(Math.random() * currentIndex);
    currentIndex--;
    [array[currentIndex], array[randomIndex]] = [
      array[randomIndex],
      array[currentIndex],
    ];
  }
  return array;
}

/**
 * Paints the given renderOjects to the main canvas context.
 *
 * @param {Array} renderObjectArray Array of render elements to draw to canvas
 * @param {Object} layerData data passed from the current iteration of the loop or configured dna-set
 *
 */
const paintLayers = (canvasContext: any, renderObjectArray: any, layerData: any) => {
  debugLogs ? console.log("\nClearing canvas") : null;
  canvasContext.clearRect(0, 0, format.width, format.height);

  const { abstractedIndexes, _background } = layerData;

  renderObjectArray.forEach((renderObject: any) => {
    // one main canvas
    // each render Object should be a solo canvas
    // append them all to main canbas
    canvasContext.globalAlpha = renderObject.layer.opacity;
    canvasContext.globalCompositeOperation = renderObject.layer.blendmode;
    canvasContext.drawImage(
      drawElement(renderObject),
      0,
      0,
      format.width,
      format.height
    );
  });

  if (_background.generate) {
    canvasContext.globalCompositeOperation = "destination-over";
    drawBackground(canvasContext, background);
  }
  debugLogs
    ? console.log("Editions left to create: ", abstractedIndexes)
    : null;
};

const postProcessMetadata = (layerData: any) => {
  const { abstractedIndexes, layerConfigIndex } = layerData;
  // Metadata options
  const savedFile = fs.readFileSync(
    `${buildDir}/images/${abstractedIndexes[0]}${outputJPEG ? ".jpg" : ".png"}`
  );
  const _imageHash = hash(savedFile);

  // if there's a prefix for the current configIndex, then
  // start count back at 1 for the name, only.
  const _prefix = layerConfigurations[layerConfigIndex].namePrefix
    ? layerConfigurations[layerConfigIndex].namePrefix
    : null;
  // if resetNameIndex is turned on, calculate the offset and send it
  // with the prefix
  let _offset = 0;
  // @ts-expect-error TS(2339): Property 'resetNameIndex' does not exist on type '... Remove this comment to see the full error message
  if (layerConfigurations[layerConfigIndex].resetNameIndex) {
    _offset = layerConfigurations[layerConfigIndex - 1].growEditionSizeTo;
  }

  return {
    _imageHash,
    _prefix,
    _offset,
  };
};

const outputFiles = (
  abstractedIndexes: any,
  layerData: any,
  _buildDir = buildDir,
  _canvas = canvas
) => {
  const { newDna, layerConfigIndex } = layerData;
  // Save the canvas buffer to file
  saveImage(abstractedIndexes[0], _buildDir, _canvas);

  const { _imageHash, _prefix, _offset } = postProcessMetadata(layerData);

  addMetadata(newDna, abstractedIndexes[0], {
    _prefix,
    _offset,
    _imageHash,
  });

  saveMetaDataSingleFile(abstractedIndexes[0], _buildDir);
  console.log(chalk.cyan(`Created edition: ${abstractedIndexes[0]}`));
};

export const startCreating = async (storedDNA: any) => {
  if (storedDNA) {
    console.log(`using stored dna of ${storedDNA.size}`);
    dnaList = storedDNA;
    dnaList.forEach((dna) => {
      const editionExp = /\d+\//;
      // @ts-expect-error TS(2571): Object is of type 'unknown'.
      const dnaWithoutEditionNum = dna.replace(editionExp, "");
      uniqueDNAList.add(filterDNAOptions(dnaWithoutEditionNum));
    });
  }
  let layerConfigIndex = 0;
  let editionCount = 1; //used for the growEditionSize while loop, not edition number
  let failedCount = 0;
  let abstractedIndexes: any = [];
  for (
    let i = startIndex;
    i <=
    startIndex +
      layerConfigurations[layerConfigurations.length - 1].growEditionSizeTo -
      1;
    i++
  ) {
    abstractedIndexes.push(i);
  }
  if (shuffleLayerConfigurations) {
    abstractedIndexes = shuffle(abstractedIndexes);
  }
  debugLogs
    ? console.log("Editions left to create: ", abstractedIndexes)
    : null;
  while (layerConfigIndex < layerConfigurations.length) {
    const layers = layersSetup(
      layerConfigurations[layerConfigIndex].layersOrder
    );
    while (
      editionCount <= layerConfigurations[layerConfigIndex].growEditionSizeTo
    ) {
      let newDna = createDna(layers);
      if (isDnaUnique(newDna)) {
        let results = constructLayerToDna(newDna, layers);
        debugLogs ? console.log("DNA:", newDna.split(DNA_DELIMITER)) : null;
        let loadedElements: any = [];
        // reduce the stacked and nested layer into a single array
        const allImages = results.reduce((images: any, layer: any) => {
          return [...images, ...layer.selectedElements];
        }, []);
        sortZIndex(allImages).forEach((layer: any) => {
          loadedElements.push(loadLayerImg(layer));
        });

        await Promise.all(loadedElements).then((renderObjectArray) => {
          const layerData = {
            newDna,
            layerConfigIndex,
            abstractedIndexes,
            _background: background,
          };
          paintLayers(ctxMain, renderObjectArray, layerData);
          // Todo: layerData contained abstracedIndexes it doesn't neet to pass both
          outputFiles(abstractedIndexes, layerData);

        });

        // prepend the same output num (abstractedIndexes[0])
        // to the DNA as the saved files.
        dnaList.add(
          `${abstractedIndexes[0]}/${newDna}${
            generatedBackground ? "___" + generatedBackground : ""
          }`
        );
        uniqueDNAList.add(filterDNAOptions(newDna));
        editionCount++;
        abstractedIndexes.shift();
      } else {
        console.log(chalk.bgRed("DNA exists!"));
        failedCount++;
        if (failedCount >= uniqueDnaTorrance) {
          console.log(
            `You need more layers or elements to grow your edition to ${layerConfigurations[layerConfigIndex].growEditionSizeTo} artworks!`
          );
          process.exit();
        }
      }
    }
    layerConfigIndex++;
  }
  writeMetaData(JSON.stringify(metadataList, null, 2));
  writeDnaLog(JSON.stringify([...dnaList], null, 2));
};
