"use strict";

import fs from "fs";
import { Command } from "commander";
const program = new Command();
import chalk from "chalk";

import { startCreating, buildSetup } from "./src/main";

program
  .name("generate")
  .option("-c, --continue <dna>", "Continues generating using a _dna.json file")
  .action((options: any) => {
    console.log(chalk.green("Genator started"), options.continue);
    options.continue
      ? console.log(
          chalk.bgCyanBright("\n continuing generation using _dna.json file \n")
        )
      : null;
    buildSetup();
    let dna = null;
    if (options.continue) {
      console.log(options.continue);
      const storedGenomes = JSON.parse(fs.readFileSync(options.continue).toString());
      dna = new Set(storedGenomes);
      console.log({ dna });
    }

    startCreating(dna);
  });

program.parse();
