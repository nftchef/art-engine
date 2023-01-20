"use strict";

// @ts-expect-error TS(2451): Cannot redeclare block-scoped variable 'path'.
const path = require("path");
// @ts-expect-error TS(2451): Cannot redeclare block-scoped variable 'isLocal'.
const isLocal = typeof process.pkg === "undefined";
// @ts-expect-error TS(2451): Cannot redeclare block-scoped variable 'basePath'.
const basePath = isLocal ? process.cwd() : path.dirname(process.execPath);

// @ts-expect-error TS(2451): Cannot redeclare block-scoped variable 'fs'.
const fs = require("fs");
// @ts-expect-error TS(2451): Cannot redeclare block-scoped variable 'Command'.
const { Command } = require("commander");
// @ts-expect-error TS(2451): Cannot redeclare block-scoped variable 'program'.
const program = new Command();
// @ts-expect-error TS(2451): Cannot redeclare block-scoped variable 'chalk'.
const chalk = require("chalk");

// @ts-expect-error TS(2451): Cannot redeclare block-scoped variable 'startCreat... Remove this comment to see the full error message
const { startCreating, buildSetup } = require(path.join(
  basePath,
  "/src/main.js"
));

program
  .name("generate")

  .option("-c, --continue <dna>", "Continues generatino using a _dna.json file")
  .action((options: any) => {
    console.log(chalk.green("genator started"), options.continue);
    options.continue
      ? console.log(
          chalk.bgCyanBright("\n continuing generation using _dna.json file \n")
        )
      : null;
    buildSetup();
    let dna = null;
    if (options.continue) {
      const storedGenomes = JSON.parse(fs.readFileSync(options.continue));
      dna = new Set(storedGenomes);
      console.log({ dna });
    }

    startCreating(dna);
  });

program.parse();
