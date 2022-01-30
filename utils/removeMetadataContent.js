/* 
---------------
This utility can be used for removing unwanted data from json files such as "dna" or "external_url".
Created by modifying removeTrait.js utility.

Use by running the following command;
```
node utils/removeMetadataContent.js "Background"
```

or for additional logging, use with the `-d` flag
```
node utils/removeMetadataContent.js "Background" -d
```

- BB
---------------
*/


"use strict";

const isLocal = typeof process.pkg === "undefined";
const basePath = isLocal ? process.cwd() : path.dirname(process.execPath);
const fs = require("fs");
const path = require("path");
const { Command } = require("commander");
const program = new Command();

const chalk = require("chalk");
const jsonDir = `${basePath}/build/json`;
const metadataFilePath = `${basePath}/build/json/_metadata.json`;

const getIndividualJsonFiles = () => {
  return fs
    .readdirSync(jsonDir)
    .filter((item) => /^[0-9]{1,6}.json/g.test(item));
};

program
  .argument("<target>")
  .option("-d, --debug", "display some debugging")
  .action((target, options, command) => {
    const jsonFiles = getIndividualJsonFiles();
    options.debug
      ? console.log(
          `Found ${jsonFiles.length} json files in "${jsonDir}" to process`
        )
      : null;

    console.log(chalk.greenBright.inverse(`Removing ${target}`));
    jsonFiles.forEach((filename) => {
      // read the contents
      options.debug ? console.log(`removing ${target} from ${filename}`) : null;
      const contents = JSON.parse(fs.readFileSync(`${jsonDir}/${filename}`));

      const hasTarget = contents.hasOwnProperty(target);

      if (!hasTarget) {
        console.log(chalk.yellow(`"${target}" not found in ${filename}`));
      }
      // remove the target from attributes

      delete contents[target]

      // write the file
      fs.writeFileSync(
        `${jsonDir}/${filename}`,
        JSON.stringify(contents, null, 2)
      );

      options.debug
        ? console.log(
            hasTarget ? chalk.greenBright("Removed \n") : "…skipped \n"
          )
        : null;
    });
  });

program.parse();
