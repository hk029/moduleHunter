#!/usr/bin/env node

const program = require("commander");
const hunter = require("./index");
const path = require("path");
const fs = require("fs");

const { log, error } = console;
const { getDep, outputPack } = hunter.default;

const getModule = async (type, data) => {
  let pack;
  switch (type) {
    case "file":
      let filePath = path.resolve(process.cwd(), data) + "/package.json";
      if (fs.existsSync(filePath)) {
        pack = JSON.parse(fs.readFileSync(filePath).toString());
      } else {
        error(`The ${data} directory does not have a package.json file`);
      }
      break;
    case "mod":
      break;
  }
  let c = await getDep(pack.dependencies);
  outputPack(c);
};

program
  .version("v" + require("./package.json").version)
  .description("Manipulate asar archive files")
  .option("-d, --dir", "the directory that contain the package.json")
  .option("-m, --module [module's name]", "the module in NPM");

program
  .command("pack <dir> <output>")
  .alias("p")
  .description("create asar archive")
  .action(function(__dirpath, output) {
    console.log(output + "文件成功生成");
  });

console.log(process.argv);
program.parse(process.argv);
console.log(__dirname);
console.log(process.cwd());
console.log(program.args);
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
