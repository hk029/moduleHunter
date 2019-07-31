const ora = require('ora');
const path = require('path');
const fs = require('fs');
const { mapObj, printPack, printMod } = require('./util');
const API = require('./npmApi');
const Cache = require('./cache');

let cache = null; 
let npmAPI = null;
let print = true;

class MouduleHunter {
    constructor(config = {}) {
        this.getDep = this.getDep.bind(this);
        this.getPack = this.getPack.bind(this);
        this.getAllDep = this.getAllDep.bind(this);
        cache = new Cache({ capacity: config.cacheSize || 1000 });
        npmAPI = new API({registry : config.registry});
    }
    // 这是一个递归函数
    async getDep(dependencies, already = {}) {
        // 如果为空，则返回
        let genDep = {}; //生成新的依赖关系
        let spinner = ora();
        if (JSON.stringify(dependencies) === '{}') {
            return {};
        }
        // 保存所有的依赖到已访问对象中
        for (let key in dependencies) {
            // 获取当前依赖的版本信息
            let inVersion = dependencies[key];
            let curDep;
            print && spinner.start(`正在寻找依赖：${key} ${inVersion}`).start();
            // 获取当前包信息
            const res = await npmAPI.packOfVersion(key, inVersion);
            if (res.code !== 200) {
                print && spinner.fail(`${key} ${inVersion}  不存在`);
            } else {
                let pack = res.data;
                const { version } = pack;
                let cacheDeps = cache.get(key + version);
                // 看cache里有没有当前版本的包，如果有就直接读取
                if (cacheDeps) {
                    genDep[key] = cacheDeps;
                    print &&
                        spinner.succeed(
                            '命中缓存：' + printMod(key, cacheDeps, version)
                        );
                } else {
                    // 否则需要递归查找当前包的依赖情况
                    if (already[key] === version) {
                        // 说明已经出现循环依赖
                        print &&
                            spinner.fail(`出现循环依赖：${key} ${version}`);
                        genDep[key] = { version, dependencies: {} };
                    } else {
                        curDep = pack.dependencies || {};
                        print &&
                            spinner.succeed(
                                printMod(key, { inVersion }, version)
                            );
                        // 保存当前版本到已访问中
                        already[key] = version;
                        // 把当前版本全加入列表，并且递归调用
                        genDep[key] = {
                            version,
                            inVersion,
                            dependencies: await this.getDep(curDep, already)
                        };
                        // 把获取的依赖信息加入缓存
                        cache.put(key + version, genDep[key]);
                    }
                }
            }
        }
        return genDep;
    }

    // 获取依赖
    async getAllDep(type, data, plain = false) {
        let pack, dep;
        switch (type) {
            case 'dir':
                let filePath =
                    path.resolve(process.cwd(), data) + '/package.json';
                if (fs.existsSync(filePath)) {
                    pack = JSON.parse(fs.readFileSync(filePath).toString());
                } else {
                    error(
                        `The ${data} directory does not have a package.json file`
                    );
                }
                break;
            case 'mod':
                pack = await this.getPack(data);
                break;
            default:
                break;
        }
        dep = await this.getDep(pack.dependencies);
        // if (plain) {
        //   dep = this.plaintDep(dep);
        // }
        pack.dependencies = dep;
        cache.persistence();
        return pack;
    }

    async packOverall(key, returnVal) {
        const res = await npmAPI.packInfo(key);
        let pack, ret;
        if (res.code === 200) {
            pack = res.data;
        }
        ret = mapObj(pack, [
            'name',
            'description',
            { 'dist-tags': 'latest', time: 'versions' }
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
            'name',
            'version',
            'keywords',
            'repository',
            'description',
            'homepage',
            'dependencies',
            { 'dist-tags': 'latest', time: 'versions' }
        ]);
        return mapObj(ret, returnVal);
    }

    outputPack(pack) {
        console.log(printPack(pack));
    }

    // 扁平化依赖
    plaintDep(dep, toArray = false) {
        const newDep = {};
        // 深度遍历，并把每一层的信息扁平放入依赖列表
        const depthTraversal = (dep, path) => {
            Object.keys(dep).map(key => {
                const newPath = path.concat(`${key} ${dep[key].version}`); // 不要直接push到path中去，会修改path
                if (!newDep[key]) {
                    newDep[key] = {
                        version: dep[key].inVersion,
                        path: newPath
                    };
                }
                depthTraversal(dep[key].dependencies, newPath);
            });
        };
        depthTraversal(dep, []);
        if (toArray) {
            return Object.keys(newDep).map(key => ({
                name: key,
                ...newDep[key]
            }));
        }
        return newDep;
    }

    // // 判断某个版本是不是在包中，如果在返回版本号，否则返回false
    // // 现在这个函数可以废除了，因为有新的接口直接查版本号
    // isVersionExist(version, pack) {
    //   let curVersion = false;
    //   if (version === "latest") {
    //     curVersion = pack["dist-tags"].latest;
    //   } else {
    //     for (let k in pack["versions"]) {
    //       // 看当前版本是不是满足条件
    //       if (semver.satisfies(k, version)) {
    //         curVersion = k;
    //         break;
    //       }
    //     }
    //   }
    //   return curVersion;
    // }
}

module.exports = MouduleHunter;
