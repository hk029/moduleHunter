import ora from "ora";
import chalk from "chalk";
import npmAPI from "./npm_api";
import semver from "semver";

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
  let text = ``;
  for (let key in pack) {
    text += `──${chalk.yellowBright("" + key)} ${chalk.cyanBright.bold(
      "" + pack[key].version
    )}${version ? chalk.greenBright.bold("-->" + version) : ""}`;
    text += printDep(pack[key].dependencies, 0);
    text += "\n";
  }
  return text;
};

class MouduleHunter {
  constructor() {
    this.getDep = this.getDep.bind(this);
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
      let version = dependencies[key];
      const spinner = ora(`正在寻找依赖：${key} ${version}`).start();
      let pack, curVersion, curDep;
      // 获取当前包信息
      pack = await npmAPI.key(key);
      if (pack.code !== 200) {
        spinner.fail(`网络错误：${pack.data}`);
      } else {
        pack = pack.data;
      }
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
      if (!curVersion) {
        spinner.fail(`${key} ${version}  不存在`);
      } else {
        // 说明已经出现循环依赖
        if (already[key] === curVersion) {
          spinner.fail(`出现循环依赖：${key} ${curVersion}`);
          genDep[key] = { version, dependencies: {} };
          // return genDep;
        } else {
          curDep = pack["versions"][curVersion].dependencies || {};
          let tmp = {};
          //  获取所有的版本信息
          let allVersion = Object.keys(pack.time);
          tmp[key] = { version, dependencies: curDep };
          spinner.succeed(printPack(tmp, curVersion));
          // 保存当前版本到已访问中
          already[key] = curVersion;
          // 把当前版本全加入列表，并且递归调用
          genDep[key] = {
            version: version,
            allVersion,
            dependencies: await this.getDep(curDep, already)
          };
        }
      }
    }
    return genDep;
  }

  outputPack(pack) {
    console.log(printPack(pack));
  }
}

export default new MouduleHunter();
