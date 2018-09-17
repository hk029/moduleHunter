#!/usr/bin/env node

const program = require("commander");
const hunter = require("./index");

const { outputPack } = hunter;

const getModule = async (type, data) => {
  outputPack(await hunter.getAllDep(type, data, true));
};

program
  .version("v" + require("./package.json").version)
  .description("Manipulate asar archive files")
  .option("-d, --dir", "the directory that contain the package.json")
  .option("-m, --module", "the module in NPM");

program.parse(process.argv);
if (program.args.length === 0) {
  program.help();
} else {
  if (program.dir) {
    getModule("dir", program.args[0]);
  }
  if (program.module) {
    getModule("mod", program.args[0]);
  }
}
