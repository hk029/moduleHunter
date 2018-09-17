const ora = require("ora");
const chalk = require("chalk");
const npmAPI = require("./npm_api");
const semver = require("semver");
const _ = require("lodash");
let print = true;

const printDep = (dep, level) => {
  let text = ``;
  for (let key in dep) {
    let version = dep[key].version || dep[key];
    text += `\n  ${"│    ".repeat(level)}├──${chalk.whiteBright(
      "" + key
    )} ${chalk.magentaBright("" + version)}`;
    text += printDep(dep[key].dependencies, level + 1);
  }
  text.replace(/\n/);
  return chalk(text);
};

const printPack = (pack, version) => {
  for (let key in pack) {
    text += `──${chalk.yellowBright("" + key)} ${chalk.cyanBright.bold(
      "" + pack[key].version
    )}${version ? chalk.greenBright.bold("-->" + version) : ""}`;
    text += printDep(pack[key].dependencies, 0);
    text += "\n";
  }
  return text;
};

const mapObj = (obj, keys) => {
  if (!keys) return obj;
  let newObj = {};
  keys.map(key => {
    if (typeof key === "object") {
      let mapKey = key;
      Object.keys(mapKey).map(tmpKey => {
        newObj[mapKey[tmpKey]] = obj[tmpKey];
      });
    } else {
      newObj[key] = obj[key];
    }
  });
  return newObj;
};

class MouduleHunter {
  constructor() {
    this.getDep = this.getDep.bind(this);
    this.getPack = this.getPack.bind(this);
  }

  // 判断某个版本是不是在包中，如果在返回版本号，否则返回false
  // 现在这个函数可以废除了，因为有新的接口直接查版本号
  isVersionExist(version, pack) {
    let curVersion = false;
    if (version === "latest") {
      curVersion = pack["dist-tags"].latest;
    } else {
      for (let k in pack["versions"]) {
        // 看当前版本是不是满足条件
        if (semver.satisfies(k, version)) {
          curVersion = k;
          break;
        }
      }
    }
    return curVersion;
  }

  // 这是一个递归函数
  async getDep(dependencies, already = {}) {
    // 如果为空，则返回
    let genDep = {};
    if (JSON.stringify(dependencies) === "{}") {
      return {};
    }
    // 保存所有的依赖到已访问对象中
    for (let key in dependencies) {
      // 获取当前依赖的版本信息
      let inVersion = dependencies[key];
      let curDep;
      let spinner;

      print && (spinner = ora(`正在寻找依赖：${key} ${inVersion}`).start());

      // 获取当前包信息
      const res = await npmAPI.packOfVersion(key, inVersion);

      if (res.code !== 200) {
        print && spinner.fail(`${key} ${version}  不存在`);
      } else {
        let pack = res.data;
        const { version } = pack;
        // 说明已经出现循环依赖
        if (already[key] === version) {
          print && spinner.fail(`出现循环依赖：${key} ${version}`);
          genDep[key] = { version, dependencies: {} };
        } else {
          curDep = pack.dependencies || {};
          let tmp = {};
          tmp[key] = { version: inVersion, dependencies: curDep };
          print && spinner.succeed(printPack(tmp, version));
          // 保存当前版本到已访问中
          already[key] = version;
          // 把当前版本全加入列表，并且递归调用
          genDep[key] = {
            version,
            dependencies: await this.getDep(curDep, already)
          };
        }
      }
    }
    return genDep;
  }

  async packOverall(key, returnVal) {
    const res = await npmAPI.packInfo(key);
    let pack, ret;
    if (res.code === 200) {
      pack = res.data;
    }
    ret = mapObj(pack, [
      "name",
      "description",
      { "dist-tags": "latest", time: "versions" }
    ]);
    return mapObj(ret, returnVal);
  }

  async getPack(key, version, returnVal) {
    const res = await npmAPI.packOfVersion(key, version);
    let ret, pack;
    if (res.code === 200) {
      pack = res.data;
    }
    ret = mapObj(pack, [
      "name",
      "version",
      "keywords",
      "repository",
      "description",
      "homepage",
      "dependencies",
      { "dist-tags": "latest", time: "versions" }
    ]);
    return mapObj(ret, returnVal);
    // return this.getDep(pack.dependencies)
  }

  outputPack(pack) {
    console.log(printPack(pack));
  }
}

module.exports = new MouduleHunter();
