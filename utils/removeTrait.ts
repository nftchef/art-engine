"use strict";

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

// @ts-expect-error TS(2451): Cannot redeclare block-scoped variable 'chalk'.
const chalk = require("chalk");
// @ts-expect-error TS(2451): Cannot redeclare block-scoped variable 'jsonDir'.
const jsonDir = `${basePath}/build/json`;

// @ts-expect-error TS(2451): Cannot redeclare block-scoped variable 'getIndivid... Remove this comment to see the full error message
const getIndividualJsonFiles = () => {
  return fs
    .readdirSync(jsonDir)
    .filter((item: any) => /^[0-9]{1,6}.json/g.test(item));
};

program
  .argument("<trait>")
  .option("-d, --debug", "display some debugging")
  .action((trait: any, options: any, command: any) => {
    const jsonFiles = getIndividualJsonFiles();
    options.debug
      ? console.log(
          `Found ${jsonFiles.length} json files in "${jsonDir}" to process`
        )
      : null;

    console.log(chalk.greenBright.inverse(`Removing ${trait}`));
    jsonFiles.forEach((filename: any) => {
      // read the contents
      options.debug ? console.log(`removing ${trait} from ${filename}`) : null;
      const contents = JSON.parse(fs.readFileSync(`${jsonDir}/${filename}`));

      const hasTrait = contents.attributes.some(
        (attr: any) => attr.trait_type === trait
      );

      if (!hasTrait) {
        console.log(chalk.yellow(`"${trait}" not found in ${filename}`));
      }
      // remove the trait from attributes

      contents.attributes = contents.attributes.filter(
        (traits: any) => traits.trait_type !== trait
      );

      // write the file
      fs.writeFileSync(
        `${jsonDir}/${filename}`,
        JSON.stringify(contents, null, 2)
      );

      options.debug
        ? console.log(
            hasTrait ? chalk.greenBright("Removed \n") : "…skipped \n"
          )
        : null;
    });
  });

program.parse();
