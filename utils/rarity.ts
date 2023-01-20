"use strict";

// @ts-expect-error TS(2451): Cannot redeclare block-scoped variable 'path'.
const path = require("path");
// @ts-expect-error TS(2580): Cannot find name 'require'. Do you need to install... Remove this comment to see the full error message
const createCsvWriter = require("csv-writer").createObjectCsvWriter;

// @ts-expect-error TS(2451): Cannot redeclare block-scoped variable 'isLocal'.
const isLocal = typeof process.pkg === "undefined";
// @ts-expect-error TS(2451): Cannot redeclare block-scoped variable 'basePath'.
const basePath = isLocal ? process.cwd() : path.dirname(process.execPath);
// @ts-expect-error TS(2451): Cannot redeclare block-scoped variable 'fs'.
const fs = require("fs");
// const layersDir = `${basePath}/layers`;
// @ts-expect-error TS(2451): Cannot redeclare block-scoped variable 'layersDir'... Remove this comment to see the full error message
const layersDir = path.join(basePath, "../", "genkiFiles");

const {
  // @ts-expect-error TS(2451): Cannot redeclare block-scoped variable 'layerConfi... Remove this comment to see the full error message
  layerConfigurations,
  // @ts-expect-error TS(2451): Cannot redeclare block-scoped variable 'extraAttri... Remove this comment to see the full error message
  extraAttributes,
  // @ts-expect-error TS(2451): Cannot redeclare block-scoped variable 'rarityDeli... Remove this comment to see the full error message
  rarityDelimiter,
// @ts-expect-error TS(2580): Cannot find name 'require'. Do you need to install... Remove this comment to see the full error message
} = require(path.join(basePath, "/src/config.js"));

// @ts-expect-error TS(2451): Cannot redeclare block-scoped variable 'getElement... Remove this comment to see the full error message
const { getElements, cleanName } = require("../src/main.js");
const metadataPath = path.join(basePath, "/build/json/_metadata.json");

function calculate(options = {}) {
  let rarity = {};
  let totals = {};
  let attributeCounts = {};

  const dataset = JSON.parse(fs.readFileSync(metadataPath)); // filter out .DS_Store
  // .filter((item) => {
  //   return !/(^|\/)\.[^\/\.]/g.test(item);
  // });
  dataset.forEach((metadata: any) => {
    // const readData = fs.readFileSync(path.join(basePath, inputdir, file));
    // const metadata = JSON.parse(readData);
    // Push the attributes to the main counter and increment
    metadata.attributes = metadata.attributes.filter(
      (attr: any) => attr.value !== ""
    );

    // add a count to the attribue counts
    // @ts-expect-error TS(7053): Element implicitly has an 'any' type because expre... Remove this comment to see the full error message
    attributeCounts[metadata.attributes.length] = attributeCounts[
      metadata.attributes.length
    ]
      // @ts-expect-error TS(7053): Element implicitly has an 'any' type because expre... Remove this comment to see the full error message
      ? attributeCounts[metadata.attributes.length] + 1
      : 1;

    metadata.attributes.forEach((attribute: any) => {
      rarity = {
        ...rarity,
        [attribute.trait_type]: {
          // @ts-expect-error TS(7053): Element implicitly has an 'any' type because expre... Remove this comment to see the full error message
          ...rarity[attribute.trait_type],
          [attribute.value]: {
            // @ts-expect-error TS(7053): Element implicitly has an 'any' type because expre... Remove this comment to see the full error message
            count: rarity[attribute.trait_type]
              // @ts-expect-error TS(7053): Element implicitly has an 'any' type because expre... Remove this comment to see the full error message
              ? rarity[attribute.trait_type][attribute.value]
                // @ts-expect-error TS(7053): Element implicitly has an 'any' type because expre... Remove this comment to see the full error message
                ? rarity[attribute.trait_type][attribute.value].count + 1
                : 1
              : 1,
          },
        },
      };

      totals = {
        ...totals,
        // @ts-expect-error TS(7053): Element implicitly has an 'any' type because expre... Remove this comment to see the full error message
        [attribute.trait_type]: totals[attribute.trait_type]
          // @ts-expect-error TS(7053): Element implicitly has an 'any' type because expre... Remove this comment to see the full error message
          ? (totals[attribute.trait_type] += 1)
          : 1,
      };
    });
  });

  // loop again to write percentages based on occurrences/ total supply
  for (const category in rarity) {
    // @ts-expect-error TS(7053): Element implicitly has an 'any' type because expre... Remove this comment to see the full error message
    for (const element in rarity[category]) {
      // @ts-expect-error TS(7053): Element implicitly has an 'any' type because expre... Remove this comment to see the full error message
      rarity[category][element].percentage = (
        // @ts-expect-error TS(7053): Element implicitly has an 'any' type because expre... Remove this comment to see the full error message
        (rarity[category][element].count / dataset.length) *
        100
      ).toFixed(4);
    }
  }

  // sort everything alphabetically (could be refactored)
  for (let subitem in rarity) {
    // @ts-expect-error TS(7053): Element implicitly has an 'any' type because expre... Remove this comment to see the full error message
    rarity[subitem] = Object.keys(rarity[subitem])
      .sort()
      .reduce((obj, key) => {
        // @ts-expect-error TS(7053): Element implicitly has an 'any' type because expre... Remove this comment to see the full error message
        obj[key] = rarity[subitem][key];
        return obj;
      }, {});
  }
  const ordered = Object.keys(rarity)
    .sort()
    .reduce((obj, key) => {
      // @ts-expect-error TS(7053): Element implicitly has an 'any' type because expre... Remove this comment to see the full error message
      obj[key] = rarity[key];
      return obj;
    }, {});

  // append attribute count as a trait
  // @ts-expect-error TS(7053): Element implicitly has an 'any' type because expre... Remove this comment to see the full error message
  ordered["Attribute Count"] = {};

  for (const key in attributeCounts) {
    console.log(`attributeCounts ${key}`);
    // @ts-expect-error TS(7053): Element implicitly has an 'any' type because expre... Remove this comment to see the full error message
    ordered["Attribute Count"][`${key} Attributes`] = {
      // @ts-expect-error TS(7053): Element implicitly has an 'any' type because expre... Remove this comment to see the full error message
      count: attributeCounts[key],
      // @ts-expect-error TS(2362): The left-hand side of an arithmetic operation must... Remove this comment to see the full error message
      percentage: (attributeCounts[key] / dataset.length).toFixed(4) * 100,
    };
  }

  // TODO: Calculate rarity score by looping through the set again
  console.log({ count: dataset.length });

  const tokenRarities: any = [];

  dataset.forEach((metadata: any) => {
    metadata.attributes = metadata.attributes.filter(
      (attr: any) => attr.value !== ""
    );

    // look up each one in the rarity data, and sum it
    const raritySum = metadata.attributes.reduce((sum: any, attribute: any) => {
      return (
        // @ts-expect-error TS(7053): Element implicitly has an 'any' type because expre... Remove this comment to see the full error message
        sum + Number(ordered[attribute.trait_type][attribute.value].percentage)
      );
    }, 0);

    tokenRarities.push({ name: metadata.name, raritySum });
  });

  // @ts-expect-error TS(7006): Parameter 'a' implicitly has an 'any' type.
  tokenRarities.sort((a, b) => {
    return a.raritySum - b.raritySum;
  });

  console.log(ordered);
  console.log(attributeCounts);
  outputRarityCSV(ordered);

  // console.log(tokenRarities);
  console.table(tokenRarities);
  // @ts-expect-error TS(2339): Property 'outputRanking' does not exist on type '{... Remove this comment to see the full error message
  options.outputRanking ? outputRankingCSV(tokenRarities) : null;
}

/**
 * converts the sorted rarity data objects into the csv output we are looking for
 * @param {Array} rarityData all calculated usages and percentages
 */
async function outputRarityCSV(rarityData: any) {
  const csvWriter = createCsvWriter({
    path: path.join(basePath, "build/_rarity.csv"),
    header: [
      { id: "name", title: "Attribute" },
      { id: "count", title: "Count" },
      { id: "percentage", title: "Percentage" },
    ],
  });
  // loop through the
  for (const trait in rarityData) {
    await csvWriter.writeRecords([
      { name: "" },
      {
        name: trait,
      },
    ]);
    console.log({ trait });
    const rows = [];
    // @ts-expect-error TS(2550): Property 'entries' does not exist on type 'ObjectC... Remove this comment to see the full error message
    for (const [key, value] of Object.entries(rarityData[trait])) {
      rows.push({
        name: key,
        count: rarityData[trait][key].count,
        percentage: rarityData[trait][key].percentage,
      });
    }
    await csvWriter.writeRecords(rows);
    console.log(rows);
  }
}

/**
 * outputs a csv of ordered and ranked tokens by rarity score.
 * @param {Array[Objects]} ranking sorted ranking data
 */
function outputRankingCSV(ranking: any) {
  const csvWriter = createCsvWriter({
    path: path.join(basePath, "build/_ranking.csv"),
    header: [
      { id: "name", title: "NAME" },
      { id: "raritySum", title: "Rarity Sum" },
    ],
  });
  csvWriter.writeRecords(ranking);
}

calculate({ outputRanking: true });
