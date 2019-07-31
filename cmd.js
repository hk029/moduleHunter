#!/usr/bin/env node

const program = require('commander');
const Hunter = require('./index');

let hunter = null;

const getModule = async (type, data) => {
    hunter.outputPack(await hunter.getAllDep(type, data, true));
};

program
    .version('v' + require('./package.json').version)
    .description('Manipulate asar archive files')
    .option('-d, --dir', 'the directory that contain the package.json')
    .option('-m, --module', 'the module in NPM')
    .option(
        '-r, --registry <address>',
        'set the registry address (default: https://r.cnpmjs.org)'
    );

program.parse(process.argv);
if (program.args.length === 0) {
    program.help();
} else {
    if (program.registry) {
        hunter = new Hunter({ registry: program.registry });
    } else {
        hunter = new Hunter();
    }
    if (program.dir) {
        getModule('dir', program.args[0]);
    } else if (program.module) {
        getModule('mod', program.args[0]);
    }
}
