const chalk = require("chalk");
class Util {
  constructor() {
    this.printPack = this.printPack.bind(this);
    this.printDepTree = this.printDepTree.bind(this);
    this.printMod = this.printMod.bind(this);
  }
  promisify(f) {
    return function() {
      let args = Array.prototype.slice.call(arguments);
      return new Promise(function(resolve, reject) {
        args.push(function(err, result) {
          if (err) {
            // console.log('reject!!!!!!!!!!!!!!!!!!!');
            reject(err);
          } else resolve(result);
        });
        f.apply(null, args);
      });
    };
  }

  printPack(pack) {
    let text = "";
    const { name, dependencies, version } = pack;
    if (name) {
      text += chalk.greenBright.bold(
        `\n============ ${name} v${version} 依赖情况 ==============\n`
      );
    }
    text = Object.keys(dependencies).reduce(
      (pre, key) => pre + this.printMod(key, dependencies[key]),
      text
    );
    return text;
  }

  // 第三个参数是当前匹配的版本号，如果传入了这个值
  // 则表示当前输出是在进行中，因此不会打印后续的依赖关系树
  printMod(name, data, version) {
    let text = "";
    if (!version) {
      text += "──";
    }
    text = `${chalk.yellowBright("" + name)} ${chalk.cyanBright.bold(
      "" + data.inVersion
    )}${version ? chalk.greenBright.bold("-->" + version) : ""}`;
    if (!version) {
      text += this.printDepTree(data.dependencies, 0);
      text += "\n";
    }
    return text;
  }

  printDepTree(dep, level) {
    let text = "";
    for (let key in dep) {
      let version = dep[key].version || dep[key];
      text += `\n  ${"│    ".repeat(level)}├──${chalk.whiteBright(
        "" + key
      )} ${chalk.magentaBright("" + version)}`;
      text += this.printDepTree(dep[key].dependencies, level + 1);
    }
    text.replace(/\n/);
    return chalk(text);
  }

  mapObj(obj, keys) {
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
  }
}

module.exports = new Util();
