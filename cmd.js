#!/usr/bin/env node

const program = require("commander");
const hunter = require("./index");
const path = require("path");
const fs = require("fs");

const { log, error } = console;
const { getDep, outputPack, getPack, packOverall } = hunter;

const getModule = async (type, data) => {
  let pack;
  switch (type) {
    case "file":
      console.log(path.resolve(process.cwd(), data));
      let filePath = path.resolve(process.cwd(), data) + "/package.json";
      if (fs.existsSync(filePath)) {
        pack = JSON.parse(fs.readFileSync(filePath).toString());
      } else {
        error(`The ${data} directory does not have a package.json file`);
      }
      break;
    case "mod":
      pack = await getPack(data);
      break;
  }
  let c = await getDep(pack.dependencies);
  outputPack(c);
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
    getModule("file", program.args[0]);
  }
  if (program.module) {
    getModule("mod", program.args[0]);
  }
}
